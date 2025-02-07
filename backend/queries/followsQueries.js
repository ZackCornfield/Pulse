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

    addFollow: async (followerId, followingId) => {
        try {
            const follow = await prisma.follow.create({
                data: {
                  followerId,
                  followingId,
                },
            });
            return follow;
        }
        catch(error) {
            console.error("Error adding follow entry", error);
            throw new Error("Error adding follow entry");
        }
    },

    removeFollow: async (followerId, followingId) => {
        try {
            const unfollow = await prisma.follow.delete({
                where: {
                  followerId_followingId: {
                    followerId,
                    followingId,
                  },
                },
              });
              return unfollow;
        }
        catch(error) {
            console.error("Error removing follow entry", error);
            throw new Error("Error removing follow entry");
        }
      },
}