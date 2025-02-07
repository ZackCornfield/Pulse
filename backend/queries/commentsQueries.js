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

// Recursive query function
const getFullNestedCommentsCount = async function getFullNestedCommentsCount(commentId) {
    // Count the immediate nested comments
    const directNestedCount = await prisma.comment.count({
      where: { parentId: commentId },
    });
  
    // Fetch all the direct nested comments' IDs
    const directNestedComments = await prisma.comment.findMany({
      where: { parentId: commentId },
    });
  
    let totalCount = directNestedCount;
  
    // Recursively count nested comments for each direct nested comment
    for (const nestedComment of directNestedComments) {
      const childCount = await getFullNestedCommentsCount(nestedComment.id);
      totalCount += childCount;
    }
  
    return totalCount;
};

module.exports = {
    getAllComments: async () => {
        try {
            const comments = await prisma.comment.findMany({});
            return comments;
        }
        catch(error) {
            console.error("Error getting all comments", error);
            throw new Error("Error getting all comments");
        }
    },
    getComment: async (id) => {
        try {
            const comment = await prisma.comment.findUnique({
                where: {
                    id
                },
                include: {
                    user: true,
                    nestedComments: true,
                    _count: {
                        select: {
                            likes: true,
                            nestedComments: true,
                        }
                    }
                }
            });
            return comment;
        }
        catch(error) {
            console.error("Error getting comment by id", error);
            throw new Error("Error getting comment by id");
        } 
    },
    getPostRootComments: async (postId, page, limit, sortField, sortOrder) => {
        const skip = (page - 1) * limit;
        if (sortField === 'nestedComments' || sortField === 'likes') {
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
            const comment = await prisma.comment.findMany({
                where: {
                  postId,
                  parentId: null,
                },
                include: {
                    user: true,
                    nestedComments: true,
                    _count: {
                        select: {
                            likes: true,
                            nestedComments: true,
                        }
                    }
                },
                orderBy: orderBy,
                skip,
                take: limit,
            });
            return comment;
        }
        catch(error) {
            console.error("Error adding comment", error);
            throw new Error("Error adding comment");
        }
    },
    addRootComment: async (userId, postId, commentContent) => {
        try {
            const comment = await prisma.comment.create({
                data: {
                  comment: commentContent,
                  userId,
                  postId,
                },
                include: {
                    user: true,
                    post: true,
                    _count: {
                        select: {
                            nestedComments: true,
                            likes: true
                        }
                    }
                },
            });
            return comment;
        }
        catch(error) {
            console.error("Error adding comment", error);
            throw new Error("Error adding comment");
        }
    },
    updateCommentContent: async (id, commentContent) => {
        try {
            const comment = await prisma.comment.update({
                where: {
                    id
                },
                data: {
                  comment: commentContent,
                },
                include: {
                    user: true,
                    nestedComments: true,
                    _count: {
                        select: {
                            likes: true,
                            nestedComments: true,
                        }
                    }
                },
            });
            return comment;
        }
        catch(error) {
            console.error("Error editing comment", error);
            throw new Error("Error editing comment");
        }
    },
    deleteComment: async (id) => {
        try {
            const comment = await prisma.comment.delete({
                where: {
                    id
                }
            });
            return comment;
        }
        catch(error) {
            console.error("Error deleting comment", error);
            throw new Error("Error deleting comment");
        }
    },
    getNestedComments: async (id, page, limit, sortField, sortOrder) => {
        const skip = (page - 1) * limit;
        if (sortField === 'nestedComments' || sortField === 'likes') {
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
            const comments = await prisma.comment.findMany({
                where: {
                    parentId: id
                },
                include: {
                    user: true,
                    nestedComments: true,
                    _count: {
                        select: {
                            likes: true,
                            nestedComments: true,
                        }
                    }
                },
                orderBy: orderBy,
                skip,
                take: limit,
            });
            return comments;
        }
        catch(error) {
            console.error("Error getting nested comments", error);
            throw new Error("Error getting nested comments");
        }
    },
    addNestedComment: async (userId, postId, commentContent, parentId) => {
        try {
            const comment = await prisma.comment.create({
                data: {
                    comment: commentContent,
                    userId,
                    postId,
                    parentId,
                },
                include: {
                    user: true,
                    parent: true,
                    _count: {
                        select: {
                            nestedComments: true,
                            likes: true
                        }
                    }
                }
            });
            return comment;
        } 
        catch (error) {
            console.error("Error adding nested comment", error);
            throw new Error("Error adding nested comment");
        }
    },
    getPostCommentCount: async (postId) => {
        try {
            const count = await prisma.comment.count({
                where: {
                    postId,
                    OR: [
                        { parentId: null }, // Count main comments
                        { parentId: { not: null } } // Count nested comments
                    ]
                }
            });
            return count;
        } 
        catch (error) {
            console.error("Error adding nested comment", error);
            throw new Error("Error adding nested comment");
        }
    },
    getFullNestedCommentsCount

}