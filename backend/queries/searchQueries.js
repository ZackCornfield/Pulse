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
            else if (type === 'realms') {
                const realms = await prisma.realm.findMany({
                    where: { 
                        OR: [
                            { name: { contains: query, mode: 'insensitive' }  },
                            { description: { contains: query, mode: 'insensitive' } }
                        ]
                    },
                    skip,
                    take: limit
                });
                return realms;
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
                const realmsPromise = prisma.realm.findMany({
                    where: { 
                        OR: [
                            { name: { contains: query, mode: 'insensitive' }  },
                            { description: { contains: query, mode: 'insensitive' } }
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
                const [users, realms, posts] = await Promise.all([usersPromise, realmsPromise, postsPromise]);
    
                // Combine results
                const combinedResults = [...users, ...realms, ...posts];
    
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