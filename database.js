const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize tables
db.serialize(() => {
    // Users table (customers)
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            city TEXT NOT NULL,
            street TEXT NOT NULL,
            landmark TEXT,
            registered_at TEXT NOT NULL
        )
    `);

    // Orders table
    db.run(`
        CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT UNIQUE NOT NULL,
            user_id INTEGER NOT NULL,
            items TEXT NOT NULL,
            total INTEGER NOT NULL,
            payment_method TEXT NOT NULL,
            status TEXT NOT NULL,
            delivery_code TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Sessions table (for customer OTP/login)
    db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    `);

    // Delivery Persons table
    db.run(`
        CREATE TABLE IF NOT EXISTS delivery_persons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            national_id TEXT NOT NULL,
            delivery_zone TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            pin TEXT NOT NULL,
            registered_at TEXT NOT NULL,
            approved_at TEXT
        )
    `);

    // Delivery Sessions table
    db.run(`
        CREATE TABLE IF NOT EXISTS delivery_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            delivery_person_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TEXT NOT NULL,
            FOREIGN KEY (delivery_person_id) REFERENCES delivery_persons(id)
        )
    `);

    // Staff table (Admin, Order Manager, Support Staff)
    db.run(`
        CREATE TABLE IF NOT EXISTS staff (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at TEXT NOT NULL,
            created_by INTEGER
        )
    `);

    // Staff Sessions table
    db.run(`
        CREATE TABLE IF NOT EXISTS staff_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            staff_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TEXT NOT NULL,
            FOREIGN KEY (staff_id) REFERENCES staff(id)
        )
    `);

    // Chat Messages table
    db.run(`
        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            user_name TEXT NOT NULL,
            sender TEXT NOT NULL,
            message TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            read INTEGER DEFAULT 0
        )
    `);

    console.log('Database initialized: database.sqlite');
    console.log('Tables: users, orders, sessions, delivery_persons, delivery_sessions, staff, staff_sessions, chat_messages');
});

module.exports = db;
