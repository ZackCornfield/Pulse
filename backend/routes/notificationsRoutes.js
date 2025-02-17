const express = require('express');
const router = express.Router();
const notificationsControllers = require('../controllers/notificationsControllers');  
const isAuthorized = require('../utils/middlewares/isAuthorized');

router.get('/', notificationsControllers.getNotifications);

module.exports = router;