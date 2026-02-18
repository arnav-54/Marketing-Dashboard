const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function setup() {
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

        console.log('Creating users table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('Checking for existing admin user...');
        const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?', ['admin@marketingos.com']);

        if (rows.length === 0) {
            console.log('Inserting demo admin user...');
            const passwordHash = await bcrypt.hash('admin123', 10);
            await connection.execute(
                'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
                ['Arnav Kumar', 'admin@marketingos.com', passwordHash]
            );
            console.log('Demo user created: admin@marketingos.com / admin123');
        } else {
            console.log('Admin user already exists.');
        }

        console.log('Database setup completed successfully.');
    } catch (err) {
        console.error('Error during setup:', err);
    } finally {
        await connection.end();
    }
}

setup();
