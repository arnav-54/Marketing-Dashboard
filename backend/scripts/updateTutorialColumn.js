const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDb() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'password',
        database: process.env.DB_NAME || 'marketing_analytics',
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
        ssl: process.env.DB_SSL ? JSON.parse(process.env.DB_SSL) : undefined
    });

    try {
        console.log('Adding tutorial_seen column...');
        await connection.execute('ALTER TABLE users ADD COLUMN IF NOT EXISTS tutorial_seen BOOLEAN DEFAULT FALSE');
        console.log('Database updated successfully.');
    } catch (err) {
        console.error('Error updating database:', err);
    } finally {
        await connection.end();
    }
}

updateDb();
