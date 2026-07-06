const express = require('express');
const { body, validationResult } = require('express-validator');
const Guest = require('../models/Guest');
const router = express.Router();

const validateRSVP = [
    body('name')
        .trim()
        .notEmpty().withMessage('Имя обязательно')
        .isLength({ min: 2, max: 100 }).withMessage('Имя от 2 до 100 символов'),
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Некорректный email'),
    body('phone')
        .optional()
        .trim()
        .matches(/^[\d\s+()-]+$/).withMessage('Некорректный телефон'),
    body('guests')
        .optional()
        .isInt({ min: 1, max: 20 }).withMessage('Гостей от 1 до 20'),
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 500 }).withMessage('Комментарий до 500 символов')
];

router.post('/', validateRSVP, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, email, phone, guests, comment } = req.body;

        const result = await Guest.create({
            name,
            email: email || '',
            phone: phone || '',
            guests_count: guests || 1,
            comment: comment || ''
        });

        console.log(`✅ Новый гость: ${name}`);

        res.status(201).json({
            success: true,
            message: 'Вы успешно зарегистрированы!',
            data: { id: result.id }
        });

    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({
            success: false,
            message: 'Ошибка при сохранении данных'
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const guests = await Guest.findAll();
        res.json({
            success: true,
            data: guests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка получения данных'
        });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const stats = await Guest.getStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка получения статистики'
        });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const guest = await Guest.findById(req.params.id);
        if (!guest) {
            return res.status(404).json({
                success: false,
                message: 'Гость не найден'
            });
        }
        res.json({
            success: true,
            data: guest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка получения данных'
        });
    }
});

router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['pending', 'confirmed', 'declined'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Неверный статус'
            });
        }

        await Guest.updateStatus(req.params.id, status);
        res.json({
            success: true,
            message: 'Статус обновлен'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка обновления'
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await Guest.delete(req.params.id);
        res.json({
            success: true,
            message: 'Запись удалена'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Ошибка удаления'
        });
    }
});

module.exports = router;