const { validationResult } = require("express-validator");
const usersQueries = require('../queries/usersQueries');
const followsQueries = require('../queries/followsQueries');
const postsQueries = require('../queries/postsQueries');
const notificationQueries = require('../queries/notificationsQueries');

module.exports = {
    getAllUsers: async (req, res) => {
        try {
            const users = await usersQueries.getAllUsers();
            res.status(200).json({
                 users    
            });
        } catch (error) {
            res.status(500).json({ error: error.message });  
        }
    },
    getUser: async (req, res) => {  
        const { id } = req.params; 
        try {
            const user = await usersQueries.getUser("id", id);
            res.status(200).json({
                user
            });
        } catch (error) {
            res.status(500).json({ error: error.message });  
        }
    },
    getSuggested: async (req, res) => {
        const { id } = req.params;
        const take = parseInt(req.query.take) || 4;
        try {
            const users = await usersQueries.getSuggestedUsers(id, take);
            res.status(200).json({
                users
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getUserPosts: async (req, res) => {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;  
        const sortField = req.query.sortField || "createdAt";
        const sortOrder = req.query.sortOrder || "desc";

        console.log("running with id, page, limit, sortField, sortOrder", id, page, limit, sortField, sortOrder);   

        try {
            const posts = await postsQueries.getUserPosts(id, page, limit, sortField, sortOrder);
            res.status(200).json({
                posts,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getUserDrafts: async (req, res) => {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;  
        const sortField = req.query.sortField || "createdAt";
        const sortOrder = req.query.sortOrder || "desc";
        
        try {
            const drafts = await postsQueries.getUserDrafts(id, page, limit, sortField, sortOrder);
            res.status(200).json({
                posts: drafts   
            });
        }  catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getUserLikedPosts: async (req, res) => {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;  
        const sortField = req.query.sortField || "createdAt";
        const sortOrder = req.query.sortOrder || "desc";

        try {
            const posts = await postsQueries.getUserLikedPosts(id, page, limit, sortField, sortOrder);    
            res.status(200).json({
                posts,
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getUserCommentedPosts: async (req, res) => {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;  
        const sortField = req.query.sortField || "createdAt";
        const sortOrder = req.query.sortOrder || "desc";

        try {
            const posts = await postsQueries.getUserCommentedPosts(id, page, limit, sortField, sortOrder);
            res.status(200).json({
                posts
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    getUserFollowers: async (req, res) => {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        try {
            const users = await usersQueries.getUserFollowers(id, page, limit);
            res.status(200).json({
                users
            })
        }
        catch(error) {
            res.status(500).json({
                error: error.message
            })
        }
    },
    getUserFollowing: async (req, res) => {
        const { id } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        try {
            const users = await usersQueries.getUserFollowing(id, page, limit);
            res.status(200).json({
                users
            })
        }
        catch(error) {
            res.status(500).json({
                error: error.message
            })
        }
    },
    updateUser: async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});  
        }

        const { id } = req.params;  
        const { username, bio } = req.body;

        try {
            const existingUser = await usersQueries.existUser("username", username);
            if (existingUser && existingUser.id !== id) {
                return res.status(400).json({ error: "Username already exists" });
            }

            const updatedUser = await usersQueries.updateUser(id, username, bio);   
            res.status(200).json({
                message: "Succesfully updated user details",
                user: updatedUser
            })  
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    deleteUser: async (req, res) => {
        const { id } = req.params;

        try { 
            const user = await usersQueries.deleteUser(id);
            res.status(200).json({
                message: "Successfully deleted user",
                user
            });
        } catch (error) {
            console.log("Erros caught by by delete user", error);   
            res.status(500).json({ error: error.message });
        }
    },
    loggedUserFollow: async (req, res) => {
        const followerid = req.user.id; 
        const followingid = req.params.id;

        try { 
            const follow = await followsQueries.addFollow(followerid, followingid);
            res.status(200).json({
                message: "Successfully followed user",
                follow 
            })
            notificationQueries.createUserFollowNotification(followingid, followerid); 
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    loggedUserUnfollow: async (req, res) => {
        const followerid = req.user.id; 
        const followingid = req.params.id;

        try { 
            const unfollow = await followsQueries.removeFollow(followerid, followingid);
            res.status(200).json({
                message: "Successfully unfollowed user",
                unfollow 
            })
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}   