const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, '../medcare.db'));

// Inicialização das tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar_seed TEXT DEFAULT 'Felix'
  );

  CREATE TABLE IF NOT EXISTS medications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    dosage TEXT,
    time TEXT,
    frequency TEXT,
    status TEXT DEFAULT 'pendente',
    color TEXT DEFAULT 'bg-blue-500',
    interactionAlert BOOLEAN DEFAULT 0,
    prescriptionExpires TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    med_name TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

module.exports = db;
