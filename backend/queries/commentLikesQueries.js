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
    addCommentLike: async (userId, commentId) => {
        try {
            const like = await prisma.commentLike.create({
                data: {
                    userId,
                    commentId,
                },
                include: {
                    comment: true,
                }
            })
            return like;
        }
        catch(error) {
            console.error("Error adding like to comment", error);
            throw new Error("Error adding like to comment");
        }
    },
    removeCommentLike: async (userId, commentId) => {
        try {
            const unlike = await prisma.commentLike.delete({
                where: {
                    userId_commentId: {
                        userId,
                        commentId,
                    }
                }
            })
            return unlike;
        }
        catch(error) {
            console.error("Error removing like to comment", error);
            throw new Error("Error removing like to comment");
        }
    }
}