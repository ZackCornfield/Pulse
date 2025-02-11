const { PrismaClient } = require("@prisma/client");

// Set database based on test or development node_env
const databaseUrl = procces.env.DATABASE_URL;

const prisma = new PrismaClient({
    datasources: {
        db: {
        url: databaseUrl,
        },
    },
});

module.exports = {
    getAllPosts: async (page, limit, sortField, sortOrder) => {
        const skip = (page - 1) * limit;
        let orderBy = {};
        if (sortField === 'comments' || sortField === 'likes') {
            orderBy = {
                [sortField]: { _count: sortOrder }
            };
        } 
        else {
            orderBy = {
                [sortField]: sortOrder
            };
        };

        try {
            const posts = await prisma.post.findMany({
                where: {
                    published: true
                },
                include: {
                    images: true,
                    author: true,
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        }
                    }
                },
                orderBy: orderBy,
                skip,
                take: limit,
            });
            return posts;
        }
        catch(error) {
            console.error("Error getting all posts", error);
            throw new Error("Error getting all posts");
        }
    },
    getFeed: async (followingUserIds, page, limit, sortField, sortOrder) => {
        const skip = (page - 1) * limit;
        let orderBy = {};
        if (sortField === 'comments' || sortField === 'likes') {
            orderBy = {
                [sortField]: { _count: sortOrder }
            };
        } 
        else {
            orderBy = {
                [sortField]: sortOrder
            };
        };

        try {
            // Fetch posts from followed users
            const posts = await prisma.post.findMany({
                where: {
                    published: true,
                    authorId: { in: followingUserIds }
                },
                distinct: ['id'], // Ensures no duplicate posts
                include: {
                    images: true,
                    author: true,
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        }
                    }
                },
                orderBy: orderBy,
                skip,
                take: limit,
            });
    
            return posts;
        }
        catch(error) {
            console.error("Error getting feed", error);
            throw new Error("Error getting feed");
        }
    },
    getUserPosts: async (authorId, page, limit, sortField, sortOrder) => {
        const skip = (page - 1) * limit;
        let orderBy = {};
        if (sortField === 'comments' || sortField === 'likes') {
            orderBy = {
                [sortField]: { _count: sortOrder }
            };
        } 
        else {
            orderBy = {
                [sortField]: sortOrder
            };
        };
        
        try {
            const posts = await prisma.post.findMany({
                where: { 
                    authorId,
                    published: true
                },
                include: {
                    images: true,
                    author: true,
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        }
                    }
                },
                orderBy: orderBy,
                skip,
                take: limit,
            });
            return posts;
        }
        catch(error) {
            console.error("Error getting users posts", error);
            throw new Error("Error getting users posts");
        }
    }, 
    getUserDrafts: async (authorId, page, limit, sortField, sortOrder) => {
        const skip = (page - 1) * limit;
        let orderBy = {};
        if (sortField === 'comments' || sortField === 'likes') {
            orderBy = {
                [sortField]: { _count: sortOrder }
            };
        } 
        else {
            orderBy = {
                [sortField]: sortOrder
            };
        };

        try {
            const drafts = await prisma.post.findMany({
                where: { 
                    authorId,
                    published: false
                },
                include: {
                    images: true,
                    author: true,
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        }
                    }
                },
                orderBy: orderBy,
                skip,
                take: limit,
            });
            return drafts;
        }
        catch(error) {
            console.error("Error getting users drafts", error);
            throw new Error("Error getting users draft");
        }
    },
    getUserLikedPosts: async (userId, page, limit, sortField, sortOrder) => {
        const skip = (page - 1) * limit;
        let orderBy = {};
        if (sortField === 'comments' || sortField === 'likes') {
            orderBy = {
                [sortField]: { _count: sortOrder }
            };
        } 
        else {
            orderBy = {
                [sortField]: sortOrder
            };
        };

        try {
            const posts = await prisma.post.findMany({
                where: {
                    published: true,
                    likes: {
                        some: {
                            userId
                        }
                    }
                },
                include: {
                    images: true,
                    author: true,
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        }
                    }
                },
                orderBy: orderBy,
                skip,
                take: limit,
            });
            return posts;
        }
        catch(error) {
            console.error("Error getting users liked posts", error);
            throw new Error("Error getting users liked posts");
        }
    },
    getUserCommentedPosts: async (userId, page, limit, sortField, sortOrder) => {
        const skip = (page - 1) * limit;
        let orderBy = {};
        if (sortField === 'comments' || sortField === 'likes') {
            orderBy = {
                [sortField]: { _count: sortOrder }
            };
        } 
        else {
            orderBy = {
                [sortField]: sortOrder
            };
        };

        try {
            const posts = await prisma.post.findMany({
                where: {
                    published: true,
                    OR: [
                        {
                            comments: {
                                some: {
                                    userId,
                                },
                            },
                        },
                        {
                            comments: {
                                some: {
                                    nestedComments: {
                                        some: {
                                            userId: userId,  // Nested comments by the user
                                        },
                                    },
                                },
                            },
                        },
                    ],
                },
                include: {
                    images: true,
                    author: true,
                    _count: {
                        select: {
                            likes: true,
                            comments: true,
                        }
                    }
                },
                orderBy: orderBy,
                skip,
                take: limit,
            });
            return posts;
        }
        catch(error) {
            console.error("Error getting users commented posts", error);
            throw new Error("Error getting users commented posts");
        }
    },
    getPost: async (id) => {
        try {
            const post = await prisma.post.findUnique({
                where: { id },
                include: {
                    images: true,
                    author: true,
                    _count: {
                        select: {
                            likes: true
                        }
                    }
                }
            })
            return post;
        }
        catch(error) {
            console.error("Error getting post", error);
            throw new Error("Error getting post");
        }
    },
    createPost: async (postData) => {
        try {
            const post = await prisma.post.create({
                data: postData
            })
            return post;
        }
        catch(error) {
            console.error("Error creating post", error);
            throw new Error("Error creating post");
        }
    },
    updatePost: async (id, updatedPostData) => {
        try {
            const post = await prisma.post.update({
                where: { id },
                data: updatedPostData,
            })
            return post;
        }
        catch(error) {
            console.error("Error updating post", error);
            throw new Error("Error updating post");
        }
    },
    deletePost: async (id) => {
        try {
            const post = await prisma.post.delete({
                where: { id },
            })
            return post;
        }
        catch(error) {
            console.error("Error deleting post", error);
            throw new Error("Error deleting post");
        }
    },
}