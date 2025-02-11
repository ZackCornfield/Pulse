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
    getSearchResults: async (query, type, page, limit) => {
        const skip = (page - 1) * limit;
        try {
            if (type === 'users') {
                const users = await prisma.user.findMany({
                    where: { 
                        OR: [
                            { username: { contains: query, mode: 'insensitive' }  },
                            { bio: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    skip,
                    take: limit
                });
                return users;
            }
            else if (type === 'posts') {
                const posts = await prisma.post.findMany({
                    where: {
                        OR: [
                            { title: { contains: query, mode: 'insensitive' } },
                            { text: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    include: {
                        images: true,
                        author: true,
                    },
                    skip,
                    take: limit
                });
                return posts;
            }
            else if (type === 'all') {
                // Fetch results from each type
                const usersPromise = prisma.user.findMany({
                    where: { 
                        OR: [
                            { username: { contains: query, mode: 'insensitive' }  },
                            { bio: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    take: limit
                });
                const postsPromise = prisma.post.findMany({
                    where: {
                        OR: [
                            { title: { contains: query, mode: 'insensitive' } },
                            { text: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    include: {
                        images: true,
                        author: true,
                    },
                    take: limit
                });
    
                // Wait for all promises to resolve
                const [users, posts] = await Promise.all([usersPromise, postsPromise]);
    
                // Combine results
                const combinedResults = [...users, ...posts];
    
                // Paginate the combined results
                const paginatedResults = combinedResults.slice(skip, skip + limit);
    
                return paginatedResults;
            }
        }
        catch (error) {
            console.error('Error getting search results:', error);
            throw new Error('Error getting search results');
        }
    }
}