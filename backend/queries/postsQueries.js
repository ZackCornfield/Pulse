const { PrismaClient } = require("@prisma/client");

// Set database based on test or development node_env
const databaseUrl = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

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
                    realm: true,
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
    getFeed: async (followingUserIds, joinedRealmIds, page, limit, sortField, sortOrder) => {
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
            // Fetch posts from followed users or joined realms in a single query
            const posts = await prisma.post.findMany({
                where: {
                    published: true,
                    OR: [
                        { authorId: { in: followingUserIds } },
                        { realmId: { in: joinedRealmIds } }
                    ]
                },
                distinct: ['id'], // Ensures no duplicate posts
                include: {
                    realm: true,
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
                    realm: true,
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
                    realm: true,
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
                    realm: true,
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
                    realm: true,
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
    getRealmPosts: async (realmId, page, limit, sortField, sortOrder) => {
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
                    realmId,
                    published: true
                },
                include: {
                    realm: true,
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
            console.error("Error getting realms posts", error);
            throw new Error("Error getting realms posts");
        }
    },
    getPost: async (id) => {
        try {
            const post = await prisma.post.findUnique({
                where: { id },
                include: {
                    realm: true,
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