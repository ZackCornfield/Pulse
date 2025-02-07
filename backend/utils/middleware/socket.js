const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const socketIO = require('socket.io');

let io;

module.exports = (server) => {
    io = socketIO(server);

    io.on('connection', (socket) => {
        console.log('New client connected:', socket.id);

        // Handle message sending
        socket.on('sendMessage', async (message) => {
            try {
                // Save message to the database
                const savedMessage = await prisma.message.create({
                    data: {
                        content: message.content || null,
                        imageUrl: message.imageUrl || null,
                        senderId: message.senderId,
                        receiverId: message.receiverId,
                    },
                });

                // Emit the message to the receiver's room
                io.to(message.receiverId).emit('receiveMessage', savedMessage);
            } catch (error) {
                console.error('Error saving message:', error);
                socket.emit('error', 'Failed to send message');
            }
        });

        // Handle joining a user's room for real-time updates
        socket.on('joinRoom', (userId) => {
            socket.join(userId);
            console.log(`User ${userId} joined room ${userId}`);
        });

        // Handle notifications
        socket.on('subscribeToNotifications', (userId) => {
            socket.join(`notifications_${userId}`);
            console.log(`User ${userId} subscribed to notifications`);
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
};

module.exports.getIO = () => io; // Export a getter function for the io instance