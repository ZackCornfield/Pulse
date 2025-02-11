const postsQueries = require("../queries/postsQueries");
const likesQueries = require('../queries/likesQueries');
const commentsQueries = require('../queries/commentsQueries');
const usersQueries = require("../queries/usersQueries");
const notificationQueries = require("../queries/notificationQueries");
const { post } = require("../routes/postsRoutes");

module.exports = { 
    getAllPosts: async (req, res) => {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';
        try {
            const posts = await postsQueries.getAllPosts(page, limit, sortField, sortOrder);
            // Respond with the created post
            res.status(200).json({
                posts,
            });
        }
        catch(error) {
            res.status(500).json({
                error: error.message
            })
        }
    },
    getFeed: async (req, res) => {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';

        try {
            // Get the user's following list
            const userFollowing = (await usersQueries.getUserFollowing(userId)).map(user => user.id);   

            // Get the feed of posts based on the user's following list
            const posts = await postsQueries.getFeed(userFollowing, page, limit, sortField, sortOrder);

            res.status(200).json({
                posts
            })
        } catch (error) {
            res.status(500).json({
                error: error.message
            })
        }
    },
    getPost: async (req, res) => {
        const { id } = req.params;
        try {
            const post = await postsQueries.getPost(id);
            res.status(200).json({
                post
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    getPostRootComments: async (req, res) => {
        const { id } = req.params;  
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';

        try {
            const comments = await commentsQueries.getPostRootComments(id, page, limit, sortField, sortOrder);
            res.status(200).json({
                comments
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    getPostLikedUsers: async (req, res) => {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        try {
            const users = await usersQueries.getUsersWhoLikedPost(id, page, limit);   
            res.status(200).json({
                users
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    updatePost: async (req, res) => {
        const { id } = req.params;
        const { title, text, published, imageIds } = req.body;
        
        try {
            const updatePostData = {
                title,
                text,
                published,
                images: {
                    connect: imageIds.map((id) => ({ id })),
                },
            };

            const updatedPost = await postsQueries.updatePost(id, updatePostData);  

            // Respond with the updated post
            res.status(200).json({
                updatedPost
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    deletePost: async (req, res) => {
        const { id } = req.params;

        try {
            const deletePost = await postsQueries.deletePost(id);   
            res.status(200).json({
                message: "Post deleted successfully",
                deletePost
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    createPost: async (req, res) => {
        const { id } = req.user.id; 
        const { title, text, published, imageIds } = req.body;   

        try {
            const newPostData = {
                authorId: id,
                title,
                text,
                published,
                images: {
                    connect: imageIds.map((id) => ({ id })),
                },
            };

            const newPost = await postsQueries.createPost(newPostData);

            // Respond with the created post
            res.status(201).json({
                message: "Post created successfully",
                newPost
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    loggedUserLikePost: async (req, res) => {   
        const userId = req.user.id;
        const postId = req.params.id;
        try {
            const like = await likesQueries.addLike(userId, postId);
            res.status(201).json({
                message: "Succesfully liked post",
                like
            })
            // Create Notification
            notificationQueries.createPostLikeNotification(like.post.authorId,userId, postId);
        }
        catch(error) {
            res.status(500).json({
                error: error.message
            })
        }
    },
    loggedUserUnlikePost: async (req, res) => {
        const userId = req.user.id;
        const postId = req.params.id;

        try { 
            const unlike = await likesQueries.removeLike(userId, postId);
            res.status(200).json({
                message: "Succesfully unliked post",
                unlike
            })
        } catch (error) {
            res.status(500).json({
                error: error.message
            })
        }
    },
    loggedUserAddComment: async (req, res) => {
        const userId = req.user.id;
        const postId = req.params.id;
        const { comment } = req.body;

        try {
            const newComment = await commentsQueries.addRootComment(userId, postId, comment);   
            res.status(201).json({
                message: "Comment added successfully",
                newComment
            })
            // Create Notification
            notificationQueries.createPostCommentNotification(newComment.post.authorId, userId, postId);
        } catch (error) {
            res.status(500).json({
                error: error.message
            })
        }
    },
    getPostCommentCount: async (req, res) => {
        const postId = req.params.id;
        try {
            const count = await commentsQueries.getPostCommentCount(postId);
            res.status(201).json({
                message: "successfully got comment count",
                count
            })
        }
        catch(error) {
            res.status(500).json({
                message: error.message
            })
        }
    }
}