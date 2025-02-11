const commentLikesQueries = require("../queries/commentLikesQueries");
const commentsQueries = require("../queries/commentsQueries");
const notificationQueries = require("../queries/notificationQueries");
const usersQueries = require("../queries/usersQueries");

module.exports = {
    getAllComments: async (req, res) => {
        try {
            const comments = await commentsQueries.getAllComments();
            res.status(200).json({
                comments
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    getComment: async (req, res) => {
        const { id } = req.params;

        try {
            const comment = await commentsQueries.getComment(id);
            res.status(200).json({
                comment
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    updateComment: async (req, res) => {
        const { id } = req.params;
        const content = req.body.comment;

        try {
            const updateComment = await commentsQueries.updateCommentContent(id, content);
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    deleteComment: async (req, res) => {
        const { id } = req.params;

        try {
            const comment = await commentsQueries.deleteComment(id);
            res.status(200).json({
                message: "Comment deleted",
                comment
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    getUsersWhoLikedComments: async (req, res) => {
        const { id } = req.params;
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;

        try {
            const users = await usersQueries.getUsersWhoLikedComment(id, page, limit);
            res.status(200).json({
                users
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    getNestedComments: async (req, res) => {
        const { id } = req.params;
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const sortField = req.query.sortField || 'createdAt';
        const sortOrder = req.query.sortOrder || 'desc';


        try {
            const nestedComments = await commentsQueries.getNestedComments(id, page, limit, sortField, sortOrder);
            res.status(200).json({
                nestedComments
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    addNestedComment: async (req, res) => {
        const userId = req.user.id; // Assuming user is authenticated and their ID is stored in req.user
        const parentId = req.params.id; // Get the parent comment ID from the URL
        const { postId, comment } = req.body; // Get postId and comment content from the request body

        try {
            const comment = await commentsQueries.addNestedComment(userId, postId, comment, parentId);
            res.status(200).json({
                message: "Successfully created nested comment",
                comment
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    getNestedCommentsCount: async (req, res) => {
        const { id } = req.params;

        try {
            const count = await commentsQueries.getFullNestedCommentsCount(id);
            res.status(200).json({
                count
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    likeComment: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;

        try {
            const like = await commentLikesQueries.addCommentLike(userId, id);
            res.status(200).json({
                message: "Comment liked",
                like
            });
            notificationQueries.createCommentLikeNotification(like.comment.userId, userId, id);
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    },
    unlikeComment: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;

        try {
            const unlike = await commentLikesQueries.removeCommentLike(userId, id);
            res.status(200).json({
                message: "Comment unliked",
                unlike
            });
        } catch (error) {
            res.status(500).json({
                error: error.message
            });
        }
    }
}