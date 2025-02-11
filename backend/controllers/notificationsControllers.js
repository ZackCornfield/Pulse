const notificationQueries = require('../queries/notificationsQueries');
const { validationResult } = require('express-validator');

module.exports = {
    getNotifications: async (req, res) => { 
        const userId = req.user.id;
        const page = req.query.page || 1;
        const limit = 10;

        try {
            const notifications = await notificationQueries.getNotifications(userId, page, limit);
            res.status(200).json({ notifications });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};