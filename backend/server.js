const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const rsvpRoutes = require('./routes/rsvpRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(helmet({
    contentSecurityPolicy: false,
}));

app.use(cors({
    origin: '*',
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== РАЗДАЧА СТАТИЧЕСКИХ ФАЙЛОВ =====
app.use(express.static(path.join(__dirname, '../')));

// API маршруты
app.use('/api/rsvp', rsvpRoutes);

app.get('/api/guests', async (req, res) => {
    try {
        const db = require('./database/database');
        const guests = await db.getAllGuests();
        res.json({ success: true, data: guests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Ошибка получения данных' });
    }
});

// ===== ОТДАЧА HTML СТРАНИЦ =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin.html'));
});

// Обработка ошибок
app.use((err, req, res, next) => {
    console.error('Ошибка сервера:', err);
    res.status(500).json({
        success: false,
        message: 'Произошла ошибка на сервере'
    });
});

// ===== ЗАПУСК СЕРВЕРА =====
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📍 http://localhost:${PORT}`);
});