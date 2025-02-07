const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Unified Authorization Middleware
const isAuthorized = (resourceType) => {
  return async (req, res, next) => {
    try {
      const { id } = req.params; // ID of the resource from the URL
      const userId = req.user.id; // ID of the currently logged-in user

      let resource;

      // Determine which resource to check and the corresponding field
      switch (resourceType) {
        case 'post':
          resource = await prisma.post.findUnique({
            where: { id },
            select: { authorId: true } // Select only the authorId
          });
          if (resource?.authorId !== userId) {
            console.log(resource.authorId);
            console.log(userId);
            return res.status(403).json({ error: "Unauthorized access" });
          }
          break;
        case 'image':
          resource = await prisma.image.findUnique({
            where: { id },
            select: { ownerId: true } // Select only the ownerId
          });
          if (resource?.ownerId !== userId) {
            return res.status(403).json({ error: "Unauthorized access" });
          }
          break;
        case 'comment':
          resource = await prisma.comment.findUnique({
            where: { id },
            select: { userId: true } // Select only the userId
          });
          if (resource?.userId !== userId) {
            return res.status(403).json({ error: "Unauthorized access" });
          }
          break;
        case 'user':
          if (id !== userId) {
            return res.status(403).json({ error: "Unauthorized access" });
          }
          break;
        default:
          return res.status(400).json({ error: "Invalid resource type" });
      }
      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error(`Error in authorization middleware: ${error.message}`);
      return res.status(500).json({ error: "Internal server error" });
    }
  };
};

module.exports = isAuthorized;