const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Database path
const DB_PATH = path.join(__dirname, '../../../data/upm.db');

class Person {
  constructor(data = {}) {
    this.personID = data.personID;
    this.name = data.name;
    this.role = data.role;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  // Get all persons
  static getAll(callback) {
    const db = new sqlite3.Database(DB_PATH);
    db.all('SELECT * FROM Person ORDER BY name', [], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new Person(row)));
      }
    });
  }

  // Get person by ID
  static getById(personID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    db.get('SELECT * FROM Person WHERE personID = ?', [personID], (err, row) => {
      db.close();
      if (err) {
        callback(err, null);
      } else if (row) {
        callback(null, new Person(row));
      } else {
        callback(null, null);
      }
    });
  }

  // Get person by role
  static getByRole(role, callback) {
    const db = new sqlite3.Database(DB_PATH);
    db.all('SELECT * FROM Person WHERE role = ? ORDER BY name', [role], (err, rows) => {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, rows.map(row => new Person(row)));
      }
    });
  }

  // Create new person
  save(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      INSERT INTO Person (name, role)
      VALUES (?, ?)
    `;

    db.run(sql, [this.name, this.role], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        this.personID = this.lastID;
        callback(null, this);
      }
    });
  }

  // Update person
  update(callback) {
    const db = new sqlite3.Database(DB_PATH);
    const sql = `
      UPDATE Person
      SET name = ?, role = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE personID = ?
    `;

    db.run(sql, [this.name, this.role, this.personID], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, this.changes > 0);
      }
    });
  }

  // Delete person
  static delete(personID, callback) {
    const db = new sqlite3.Database(DB_PATH);
    db.run('DELETE FROM Person WHERE personID = ?', [personID], function(err) {
      db.close();
      if (err) {
        callback(err, null);
      } else {
        callback(null, this.changes > 0);
      }
    });
  }
}

module.exports = Person;
