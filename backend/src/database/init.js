const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Database file path
const DB_PATH = path.join(__dirname, '../../../data/upm.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

console.log('Initializing SQLite database...');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to SQLite database.');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Read and execute schema
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

db.exec(schema, (err) => {
    if (err) {
        console.error('Error executing schema:', err.message);
        db.close();
        process.exit(1);
    }
    console.log('Database schema created successfully.');

    // Close database connection
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
            process.exit(1);
        }
        console.log('Database initialization completed.');
    });
});
