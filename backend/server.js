const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const rsvpRoutes = require('./routes/rsvpRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Функция для получения локального IP
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

const localIP = getLocalIP();

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
// Отдаем файлы из папки на уровень выше (где лежат index.html, admin.html)
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
    console.log(`📍 Локально: http://localhost:${PORT}`);
    console.log(`📍 С телефона: http://${localIP}:${PORT}`);
    console.log(`📋 Админка: http://${localIP}:${PORT}/admin.html`);
    console.log(`📄 Сайт: http://${localIP}:${PORT}/index.html`);
});