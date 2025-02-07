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

    joinRealm: async (joinerId, realmId) => {
        try {
            const join = await prisma.joinRealm.create({
                data: {
                  joinerId,
                  realmId,
                },
                include: {
                    realm: true,
                }
            });
            return join;
        }
        catch(error) {
            console.error("Error creating joinRealm entry", error);
            throw new Error("Error creating joinRealm entry");
        }
    },

    leaveRealm: async (joinerId, realmId) => {
        try {
            const join = await prisma.joinRealm.delete({
                where: {
                  joinerId_realmId: {
                    joinerId,
                    realmId
                  }
                },
            });
            return join;
        }
        catch(error) {
            console.error("Error deleting joinRealm entry", error);
            throw new Error("Error deleting joinRealm entry");
        }
      },
}