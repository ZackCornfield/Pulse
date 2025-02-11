const express = require('express');
const Router = express.Router();
const notificationsControllers = require('../controllers/notificationsController');  
const isAuthorized = require('../utils/middlewares/isAuthorized');

router.get('/', notificationsControllers.getNotifications);

module.exports = router;