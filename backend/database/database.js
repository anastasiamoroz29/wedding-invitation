const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../wedding_guests.db');

class Database {
    constructor() {
        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('❌ Ошибка подключения к базе:', err);
            } else {
                console.log('✅ Подключено к SQLite');
                this.initTables();
            }
        });
    }

    initTables() {
        const query = `
            CREATE TABLE IF NOT EXISTS guests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                guests_count INTEGER DEFAULT 1,
                comment TEXT,
                status TEXT DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        this.db.run(query, (err) => {
            if (err) {
                console.error('❌ Ошибка создания таблицы:', err);
            } else {
                console.log('✅ Таблица guests готова');
            }
        });
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async insertGuest(guestData) {
        const { name, email, phone, guests_count, comment } = guestData;
        const query = `
            INSERT INTO guests (name, email, phone, guests_count, comment)
            VALUES (?, ?, ?, ?, ?)
        `;
        const result = await this.run(query, [name, email, phone, guests_count, comment]);
        return { id: result.lastID };
    }

    async getAllGuests() {
        return this.all('SELECT * FROM guests ORDER BY created_at DESC');
    }

    async getGuestById(id) {
        const rows = await this.all('SELECT * FROM guests WHERE id = ?', [id]);
        return rows[0] || null;
    }

    async updateStatus(id, status) {
        return this.run('UPDATE guests SET status = ? WHERE id = ?', [status, id]);
    }

    async deleteGuest(id) {
        return this.run('DELETE FROM guests WHERE id = ?', [id]);
    }

    async getStats() {
        const total = await this.all('SELECT COUNT(*) as count FROM guests');
        const confirmed = await this.all("SELECT COUNT(*) as count FROM guests WHERE status = 'confirmed'");
        const declined = await this.all("SELECT COUNT(*) as count FROM guests WHERE status = 'declined'");
        const totalGuests = await this.all('SELECT SUM(guests_count) as total FROM guests');
        
        return {
            total: total[0].count,
            confirmed: confirmed[0].count,
            declined: declined[0].count,
            totalGuests: totalGuests[0].total || 0
        };
    }
}

module.exports = new Database();