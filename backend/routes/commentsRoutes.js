const express = require("express");
const router = express.Router();
const commentsControllers = require("../controllers/commentsControllers");
const isAuthorized = require("../utils/middlewares/isAuthorized");

// Get all comments
router.get("/", commentsControllers.getAllComments);

// Get comment by id
router.get("/:id", commentsControllers.getComment);

// Update comment by id
router.put("/:id", isAuthorized("comment"), commentsControllers.updateComment);

// Delete comment by id
router.delete("/:id", isAuthorized("comment"), commentsControllers.deleteComment);

// Get all liked users for a comment 
router.get("/:id/likes", commentsControllers.getUsersWhoLikedComments);

// Get nested comments for a comment
router.get("/:id/nested", commentsControllers.getNestedComments);   

// Add a nested comment to a comment
router.post("/:id/nested", commentsControllers.addNestedComment);

// Get recursive count of nested comments for a comment 
router.get("/:id/nested/count", commentsControllers.getNestedCommentsCount);

// Like a comment
router.post("/:id/like", commentsControllers.likeComment);

// Unlike a comment
router.delete("/:id/like", commentsControllers.unlikeComment);

module.exports = router;