const db = require('../database/database');

class Guest {
    static async create(guestData) {
        try {
            const result = await db.insertGuest(guestData);
            return result;
        } catch (error) {
            console.error('Ошибка создания гостя:', error);
            throw error;
        }
    }

    static async findAll() {
        try {
            return await db.getAllGuests();
        } catch (error) {
            console.error('Ошибка получения гостей:', error);
            throw error;
        }
    }

    static async findById(id) {
        try {
            return await db.getGuestById(id);
        } catch (error) {
            console.error('Ошибка поиска гостя:', error);
            throw error;
        }
    }

    static async updateStatus(id, status) {
        try {
            return await db.updateStatus(id, status);
        } catch (error) {
            console.error('Ошибка обновления статуса:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            return await db.deleteGuest(id);
        } catch (error) {
            console.error('Ошибка удаления гостя:', error);
            throw error;
        }
    }

    static async getStats() {
        try {
            return await db.getStats();
        } catch (error) {
            console.error('Ошибка получения статистики:', error);
            throw error;
        }
    }
}

module.exports = Guest;