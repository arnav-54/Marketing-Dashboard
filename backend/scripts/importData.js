require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const SUMMARY_FILE = path.join(__dirname, '../../data/summary_data.json');
const CSV_FILE = path.join(__dirname, '../../marketing_spend_data.csv');

async function importData() {
    console.log('Starting data import...');

    if (!fs.existsSync(SUMMARY_FILE)) {
        console.error(`Summary file not found at ${SUMMARY_FILE}. Run python script first.`);
    }

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'password',
        database: process.env.DB_NAME || 'marketing_analytics',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        ssl: process.env.DB_SSL ? JSON.parse(process.env.DB_SSL) : undefined
    });

    try {
        console.log('Connected to database.');

        if (fs.existsSync(SUMMARY_FILE)) {
            const rawData = fs.readFileSync(SUMMARY_FILE);
            const data = JSON.parse(rawData);

            console.log('Importing Channels Summary...');
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS channels (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255),
                    total_spend DECIMAL(15,2),
                    total_revenue DECIMAL(15,2),
                    total_conversions INT,
                    roas DECIMAL(10,2),
                    cpa DECIMAL(10,2),
                    cpc DECIMAL(10,2)
                )
            `);
            await connection.execute('TRUNCATE TABLE channels');
            if (data.channels && data.channels.length > 0) {
                const channelValues = data.channels.map(c => [
                    c.channel, c.spend, c.revenue, c.conversions, c.roas, c.cpa, c.cpc
                ]);
                await connection.query('INSERT INTO channels (name, total_spend, total_revenue, total_conversions, roas, cpa, cpc) VALUES ?', [channelValues]);
            }

            console.log('Importing Monthly Summary...');
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS monthly_performance (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    month VARCHAR(10),
                    total_spend DECIMAL(15,2),
                    total_revenue DECIMAL(15,2),
                    total_conversions INT,
                    roas DECIMAL(10,2)
                )
            `);
            await connection.execute('TRUNCATE TABLE monthly_performance');
            if (data.monthly && data.monthly.length > 0) {
                const monthlyValues = data.monthly.map(m => [
                    m.month, m.spend, m.revenue, m.conversions, m.roas
                ]);
                await connection.query('INSERT INTO monthly_performance (month, total_spend, total_revenue, total_conversions, roas) VALUES ?', [monthlyValues]);
            }

            console.log('Importing Campaigns Summary...');
            await connection.execute(`
                CREATE TABLE IF NOT EXISTS campaigns (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    channel_name VARCHAR(255),
                    campaign_name VARCHAR(255),
                    total_spend DECIMAL(15,2),
                    total_revenue DECIMAL(15,2),
                    conversions INT,
                    roas DECIMAL(10,2)
                )
            `);
            await connection.execute('TRUNCATE TABLE campaigns');
            if (data.campaigns && data.campaigns.length > 0) {
                const campaignValues = data.campaigns.map(c => [
                    c.channel, c.campaign, c.spend, c.revenue, c.conversions, c.roas
                ]);
                await connection.query('INSERT INTO campaigns (channel_name, campaign_name, total_spend, total_revenue, conversions, roas) VALUES ?', [campaignValues]);
            }
        }

        if (fs.existsSync(CSV_FILE)) {
            console.log('Importing Raw Marketing Data from CSV...');

            await connection.execute(`
                CREATE TABLE IF NOT EXISTS marketing_data (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    date DATE,
                    channel VARCHAR(255),
                    campaign_name VARCHAR(255),
                    spend DECIMAL(15,2),
                    impressions INT,
                    clicks INT,
                    conversions INT,
                    revenue DECIMAL(15,2)
                )
            `);
            await connection.execute('TRUNCATE TABLE marketing_data');

            const fileContent = fs.readFileSync(CSV_FILE, 'utf-8');
            const lines = fileContent.split('\n').filter(line => line.trim() !== '');
            const headers = lines[0].split(',');

            const BATCH_SIZE = 1000;
            let rowsToInsert = [];

            for (let i = 1; i < lines.length; i++) {
                const parts = lines[i].split(',');
                if (parts.length < 8) continue;

                const date = parts[0];
                const channel = parts[1];
                const campaign = parts[2];
                const spend = parseFloat(parts[3]) || 0;
                const impressions = parseInt(parts[4]) || 0;
                const clicks = parseInt(parts[5]) || 0;
                const conversions = parseInt(parts[6]) || 0;
                const revenue = parseFloat(parts[7]) || 0;

                rowsToInsert.push([date, channel, campaign, spend, impressions, clicks, conversions, revenue]);

                if (rowsToInsert.length >= BATCH_SIZE) {
                    await connection.query(
                        'INSERT INTO marketing_data (date, channel, campaign_name, spend, impressions, clicks, conversions, revenue) VALUES ?',
                        [rowsToInsert]
                    );
                    rowsToInsert = [];
                }
            }

            if (rowsToInsert.length > 0) {
                await connection.query(
                    'INSERT INTO marketing_data (date, channel, campaign_name, spend, impressions, clicks, conversions, revenue) VALUES ?',
                    [rowsToInsert]
                );
            }
            console.log('Raw data imported successfully.');
        } else {
            console.warn('CSV file not found, skipping raw data import.');
        }

        console.log('Data import completed successfully.');

    } catch (err) {
        console.error('Error importing data:', err);
    } finally {
        await connection.end();
    }
}

importData();
