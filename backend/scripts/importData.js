require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const DATA_FILE = path.join(__dirname, '../../data/summary_data.json');

async function importData() {
    console.log('Starting data import...');

    if (!fs.existsSync(DATA_FILE)) {
        console.error(`Data file not found at ${DATA_FILE}. Run python script first.`);
        process.exit(1);
    }

    const rawData = fs.readFileSync(DATA_FILE);
    const data = JSON.parse(rawData);

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

        console.log('Importing Channels...');
        await connection.execute('TRUNCATE TABLE channels');
        if (data.channels && data.channels.length > 0) {
            const channelValues = data.channels.map(c => [
                c.channel,
                c.spend,
                c.revenue,
                c.conversions,
                c.roas,
                c.cpa,
                c.cpc
            ]);
            const sql = 'INSERT INTO channels (name, total_spend, total_revenue, total_conversions, roas, cpa, cpc) VALUES ?';
            await connection.query(sql, [channelValues]);
        }

        console.log('Importing Monthly Performance...');
        await connection.execute('TRUNCATE TABLE monthly_performance');
        if (data.monthly && data.monthly.length > 0) {
            const monthlyValues = data.monthly.map(m => [
                m.month,
                m.spend,
                m.revenue,
                m.conversions,
                m.roas
            ]);
            const sql = 'INSERT INTO monthly_performance (month, total_spend, total_revenue, total_conversions, roas) VALUES ?';
            await connection.query(sql, [monthlyValues]);
        }

        console.log('Importing Campaigns...');
        await connection.execute('TRUNCATE TABLE campaigns');
        if (data.campaigns && data.campaigns.length > 0) {
            const campaignValues = data.campaigns.map(c => [
                c.channel,
                c.campaign,
                c.spend,
                c.revenue,
                c.conversions,
                c.roas
            ]);
            const sql = 'INSERT INTO campaigns (channel_name, campaign_name, total_spend, total_revenue, conversions, roas) VALUES ?';
            await connection.query(sql, [campaignValues]);
        }

        console.log('Data import completed successfully.');

    } catch (err) {
        console.error('Error importing data:', err);
    } finally {
        await connection.end();
    }
}

importData();
