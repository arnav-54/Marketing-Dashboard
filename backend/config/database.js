require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'password',
    database: process.env.DB_NAME || 'marketing_analytics',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    ssl: process.env.DB_SSL ? JSON.parse(process.env.DB_SSL) : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool.promise();
