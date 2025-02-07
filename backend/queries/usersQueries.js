const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcryptjs');

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
    getAllUsers: async () => {
        try {
            const users = await prisma.user.findMany({});
            return users;
        } 
        catch (error) {
            console.error('Error getting users:', error);
            throw new Error('Error getting users');
        } 
    },
    existUser: async (colName, query) => {
        try {
            const whereClause = { [colName]: query };
            const user = await prisma.user.findUnique({
                where: whereClause
            });
            return user;
        }
        catch (error) {
            console.error('Could not find user:', error);
            throw new Error('Error finding user');
        }
    },
    getSuggestedUsers: async (id, take) => {
        try {
            const user = await prisma.user.findUnique({
                where: { 
                  id
                },
                include: {
                    followers: true,
                    following: true,
                },
            });
            // Extract user's followers
            const userFollowersIds = user.followers.map(follow => follow.followingId);
            const userFollowingIds = user.following.map(follow => follow.followingId);

            // Step 1: Find users with mutual followers
            const suggestedUsers = await prisma.user.findMany({
                where: {
                  AND: [
                    { id: { not: id } }, // Exclude the current user
                    { 
                      id: { 
                        notIn: userFollowingIds // Exclude users that the current user is following
                      }
                    },
                    {
                      OR: [
                        {
                          followers: {
                            some: {
                              followerId: {
                                in: userFollowersIds
                              }
                            }
                          }
                        },
                        {
                          followers: {
                            some: {
                              followerId: {
                                in: userFollowingIds
                              }
                            }
                          }
                        }
                      ]
                    }
                  ]
                },
                include: {
                    _count: {
                        select: {
                            posts: {
                                where: {
                                    published: true
                                }
                            },
                            likes: true,
                            comments: true,
                            followers: true,
                            following: true
                        }
                    }
                },
                orderBy: {
                  followers: { _count: 'desc' }
                },
                take
            });
        
            // Step 2: If no mutual users, get the most popular users
            if (suggestedUsers.length < 4) {
                const suggestedUsersIds = suggestedUsers.map(user => user.id);
                const popularUsers = await prisma.user.findMany({
                where: {
                    AND: [
                        { id: { not: id } }, // Exclude the current user
                        { id: { notIn: suggestedUsersIds } }, // Exclude already found mutual users
                        { id: { notIn: userFollowingIds } }, // Exclude already found mutual users
                    ],
                },
                include: {
                    _count: {
                        select: {
                            posts: {
                                where: {
                                    published: true
                                }
                            },
                            likes: true,
                            comments: true,
                            followers: true,
                            following: true
                        }
                    }
                },
                orderBy: {
                    followers: { _count: 'desc' }, // Sort by number of followers
                },
                take: take - suggestedUsers.length,
                });
        
                return [...suggestedUsers, ...popularUsers];
            }
        
            return suggestedUsers;
        } 
        catch (error) {
            console.error('Could not get user suggested users:', error);
            throw new Error('Error getting user suggested users');
        }
    },
    getUser: async (colName, query) => {
        try {
            const whereClause = { [colName]: query };
            const user = await prisma.user.findUnique({
                where: whereClause,
                include: {
                    _count: {
                        select: {
                            posts: {
                                where: {
                                    published: true
                                }
                            },
                            likes: true,
                            comments: true,
                            followers: true,
                            following: true
                        }
                    }
                }
            })
            return user;
        } 
        catch (error) {
            console.error('Error finding user:', error);
            throw new Error('Error finding user');
        }
    },
    addUser: async (email, username, password) => {
        try {
            const hashedPassword = await new Promise((resolve, reject) => {
                bcrypt.hash(password, 10, (err, hashedPassword) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(hashedPassword);
                });
            });
            const user = await prisma.user.create({
                data: {
                    email: email,
                    username: username,
                    password: hashedPassword,
                    profilePictureUrl: process.env.DEFAULT_PROFILE_PICTURE_URL,
                    profilePicturePublicId: process.env.DEFAULT_PROFILE_PICTURE_PUBLIC_ID
                }
            })

            return user;
        }
        catch(error) {
            console.error('Error adding user', error);
            throw new Error('Error adding user');
        }
    },
    updateUser: async (id, username, bio) => {
        console.log("Updating user query");
        try {
            const updatedUser =  await prisma.user.update({
                where: { id },
                data: {
                    username,
                    bio
                },
                include: {
                    _count: {
                        select: {
                            posts: {
                                where: {
                                    published: true
                                }
                            },
                            likes: true,
                            comments: true,
                            followers: true,
                            following: true
                        }
                    }
                }
            });
            return updatedUser;
        }
        catch(error) {
            console.error('Error updating user', error);
            throw new Error('Error updating user');
        }
    },
    deleteUser: async (id) => {
        try {
            const deletedUser = await prisma.user.delete({
                where: { id }
            })
            return deletedUser;
        }
        catch(error) {
            console.error("Error deleting user", error);
            throw new Error("Error deleting user");
        }
    },
    getUserFollowers: async (id, page, limit) => {
        try {
            const user = await prisma.user.findUnique({
                where: { 
                  id
                },
                include: {
                    followers: {
                        include: {
                            follower: {
                                include: {
                                    _count: {
                                        select: {
                                            posts: {
                                                where: {
                                                    published: true
                                                }
                                            },
                                            likes: true,
                                            comments: true,
                                            followers: true,
                                            following: true
                                        }
                                    }
                                },
                            }
                        },
                        ...(page && limit ? { skip: (page - 1) * limit, take: limit } : {}) // Apply pagination if page and limit are provided
                    }
                },
            });
            return user.followers.map(follow => follow.follower);
        }
        catch(error) {
            console.error("Error getting user's followers", error);
            throw new Error("Error getting user's followers");
        }
    },
    getUserFollowing: async (id, page, limit) => {
        try {
            const user = await prisma.user.findUnique({
                where: { 
                    id
                },
                include: {
                    following: {
                        include: {
                            following: {
                                include: {
                                    _count: {
                                        select: {
                                            posts: {
                                                where: {
                                                    published: true
                                                }
                                            },
                                            likes: true,
                                            comments: true,
                                            followers: true,
                                            following: true
                                        }
                                    }
                                },
                            }
                        },
                        ...(page && limit ? { skip: (page - 1) * limit, take: limit } : {}) // Apply pagination if page and limit are provided
                    }
                },
            });
    
            return user?.following.map(follow => follow.following) || [];
        }
        catch (error) {
            console.error("Error getting user's following", error);
            throw new Error("Error getting user's following");
        }
    },    
    getUsersWhoLikedPost: async (postId, page, limit) => {
        const skip = (page - 1) * limit;
        try {
            const users = await prisma.user.findMany({
                where:{
                    likes: {
                        some: {
                            postId
                        }
                    }
                },
                include: {
                    _count: {
                        select: {
                            posts: {
                                where: {
                                    published: true
                                }
                            },
                            likes: true,
                            comments: true,
                            followers: true,
                            following: true
                        }
                    }
                },
                skip,
                take: limit,
            })
            return users;
        }
        catch(error) {
            console.error("Error getting users who liked post", error);
            throw new Error("Error getting users who liked post");
        }
    },
    getUsersWhoLikedComment: async (commentId, page, limit) => {
        const skip = (page - 1) * limit;
        try {
            const users = await prisma.user.findMany({
                where:{
                    commentLikes: {
                        some: {
                            commentId
                        }
                    }
                },
                include: {
                    _count: {
                        select: {
                            posts: {
                                where: {
                                    published: true
                                }
                            },
                            likes: true,
                            comments: true,
                            followers: true,
                            following: true
                        }
                    }
                },
                skip,
                take: limit,
            })
            return users;
        }
        catch(error) {
            console.error("Error getting users who liked comment", error);
            throw new Error("Error getting users who liked comment");
        }
    },
    getRealmJoiners: async (realmId, page, limit) => {
        const skip = (page - 1) * limit;
        try {
            const users = await prisma.user.findMany({
                where: { 
                    joinedRealms: {
                        some: {
                            realmId
                        }
                    }
                },
                include: {
                    _count: {
                        select: {
                            posts: {
                                where: {
                                    published: true
                                }
                            },
                            likes: true,
                            comments: true,
                            followers: true,
                            following: true
                        }
                    }
                },
                skip,
                take: limit,
            });
            return users;
        }
        catch(error) {
            console.error("Error getting realm's joined users", error);
            throw new Error("Error getting realm's joined users");
        }
    },
    getUserProfilePicturePublicId: async (id) => {
        try {
            const user = await prisma.user.findUnique({
                where: {
                    id
                }
            });
            return user.profilePicturePublicId;
        } 
        catch (error) {
            console.error('Error getting user profile picture public id', error);
            throw new Error('Error getting user profile picture public id');
        } 
    },
    updateUserProfilePicture: async (id, url, public_id) => {
        try {
            const user = await prisma.user.update({
                where: { id },
                data: {
                    profilePictureUrl: url,
                    profilePicturePublicId: public_id,
                }
            })
            return user;
        }
        catch(error) {
            console.error("Error updating user profile photo", error);
            throw new Error("Error updating user profile photo");
        }
    },
}