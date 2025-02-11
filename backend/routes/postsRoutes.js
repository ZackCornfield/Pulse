const postControllers = require("../controllers/postControllers");
const upload = require("../utils/middlewares/multer-config");

const express = require("express");
const router = express.Router(); 
const isAuthorized = require("../utils/middlewares/isAuthorized");  

// List all posts
router.get("/". postsControllers.getAllPosts);

// Get feed of posts based on following users - req.query page and pageSize to paginate
router.get('/feed', postsControllers.getFeed);

// Get a specific post including, author, images, and post's root comments + count of nested comments
router.get('/:id', postsControllers.getPost);   

// Get root comments including author, images, and post's root comments + count of nested comments
router.get('/:id/comments', postsControllers.getPostRootComments); 

// Get all users who liked a post 
router.get('/:id/likes', postControllers.getPostLikedUsers);    

// Update a post 
router.put('/:id', isAuthorized("post"), postControllers.updatePost);

// Delete a post
router.delete('/:id', isAuthorized("post"), postControllers.deletePost);

// Logged user to create a new post 
router.post('/', postsController.createPost); 

// Logged user to like a post
router.post('/:id/like', postControllers.loggedUserLikePost);

// Logged user to unlike a post
router.delete('/:id/like', postControllers.loggedUserUnlikePost);

// Logged user to add a root comment to a post (req.body.comment)
router.post('/:id/comment', postsControllers.loggedUserAddComment);

// Get comment count under a post
router.get('/:id/comments/count', postsControllers.getPostCommentCount)

module.exports = router;
