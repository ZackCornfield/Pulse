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
    addLike: async (userId, postId) => {
        try {
            const like = await prisma.like.create({
                data: {
                    userId,
                    postId,
                },
                include: {
                    post: true,
                }
            })
            return like;
        }
        catch(error) {
            console.error("Error adding like to post", error);
            throw new Error("Error adding like to post");
        }
    },
    removeLike: async (userId, postId) => {
        try {
            const unlike = await prisma.like.delete({
                where: {
                    userId_postId: {
                        userId,
                        postId,
                    }
                }
            })
            return unlike;
        }
        catch(error) {
            console.error("Error removing like to post", error);
            throw new Error("Error removing like to post");
        }
    }
}