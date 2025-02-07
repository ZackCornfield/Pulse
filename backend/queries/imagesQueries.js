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
    uploadImage: async (imageData) => {
        try {
            const image = await prisma.image.create({
                data: imageData,
            });
            return image;
        }
        catch (error) {
            console.error("Error adding image", error);
            throw new Error("Error adding image");
        }
    },
    getImage: async (id) => {
        try {
            const image = await prisma.image.findUnique({
                where: {
                    id
                }
            });
            return image;
        }
        catch (error) {
            console.error("Error finding images", error);
            throw new Error("Error finding images");
        }
    },
    deleteImagesArray: async (deleteIds) => {
        try {
            const images = await prisma.image.deleteMany({
                where: {
                  id: {
                    in: deleteIds,
                  },
                },
              });
            return images;
        }
        catch(error) {
            console.error("Error deleting images", error);
            throw new Error("Error deleting images");
        }
    },
}