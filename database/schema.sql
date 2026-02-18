CREATE DATABASE IF NOT EXISTS marketing_analytics;
USE marketing_analytics;

DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS monthly_performance;
DROP TABLE IF EXISTS channels;

CREATE TABLE channels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    total_spend DECIMAL(15, 2) DEFAULT 0.00,
    total_revenue DECIMAL(15, 2) DEFAULT 0.00,
    total_conversions INT DEFAULT 0,
    roas DECIMAL(10, 2) DEFAULT 0.00,
    cpa DECIMAL(10, 2) DEFAULT 0.00,
    cpc DECIMAL(10, 2) DEFAULT 0.00,
    avg_ctr DECIMAL(10, 4) DEFAULT 0.00,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE monthly_performance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    month VARCHAR(7) NOT NULL, 
    total_spend DECIMAL(15, 2) DEFAULT 0.00,
    total_revenue DECIMAL(15, 2) DEFAULT 0.00,
    total_conversions INT DEFAULT 0,
    roas DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE campaigns (
    id INT AUTO_INCREMENT PRIMARY KEY,
    channel_name VARCHAR(255) NOT NULL,
    campaign_name VARCHAR(255) NOT NULL,
    total_spend DECIMAL(15, 2) DEFAULT 0.00,
    total_revenue DECIMAL(15, 2) DEFAULT 0.00,
    conversions INT DEFAULT 0,
    roas DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
