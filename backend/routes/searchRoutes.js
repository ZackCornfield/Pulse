const express = require("express");
const router = express.Router();    
const searchControllers = require("../controllers/searchControllers");  

// Search for user (by username) or post (by post title and content).
router.get('/', searchControllers.getSearchResults);

module.exports = router;