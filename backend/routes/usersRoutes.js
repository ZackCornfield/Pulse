const isAuthorized = require('../utils/middlewares/isAuthorized');

const express = require('express');
const router = express.Router();
const usersControllers = require("../controllers/usersControllers");

const { validateUserUpdate } = require("../utils/middlewares/validators");

//List all users 
router.get('/', usersControllers.getAllUsers);

// Get a specific metadetails for user - num published posts, num posts liked, num posts commented, num followers, num following
router.get('/:id', usersControllers.getUser);

// Get user suggested users
router.get('/:id/suggest', usersControllers.getSuggested);

// Get a specific user posts including num likes + (root comments including count of nested comment)
router.get('/:id/posts', usersControllers.getUserPosts);

// Get all drafts from a user
router.get('/:id/drafts', isAuthorized("user"), usersControllers.getUserDrafts);

// Get specific posts user liked including the Post details
router.get('/:id/liked', usersControllers.getUserLikedPosts);

// Get specific posts user commented on including the Post details
router.get('/:id/commented', usersControllers.getUserCommentedPosts);

// Get specific user followers including their User details
router.get('/:id/followers', usersControllers.getUserFollowers);

// Get specific user following including their User details
router.get('/:id/following', usersControllers.getUserFollowing);

// Update a user
router.put('/:id', isAuthorized("user"), [validateUserUpdate, usersControllers.updateUser]);

// Delete a user
router.delete('/:id', isAuthorized("user"), usersControllers.deleteUser);

// Follow a user
router.post('/:id/follow', usersControllers.loggedUserFollow);

// Unfollow a user
router.delete('/:id/follow', usersControllers.loggedUserUnfollow);

module.exports = router;