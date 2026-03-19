const Message = require('./models/Message');
const Notification = require('./models/Notification');

module.exports = (io) => {
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Save userId → socketId mapping
    socket.on('join', (userId) => {
      onlineUsers.set(userId, socket.id);
      socket.join(userId);
    });

    // Send message
    socket.on('sendMessage', async ({ senderId, receiverId, text, orderId }) => {
      try {
        const message = await Message.create({
          sender: senderId,
          receiver: receiverId,
          text,
          orderId: orderId || null,
        });

        // Create notification for receiver
        await Notification.create({
          user: receiverId,
          message: 'You have a new message!',
          type: 'message',
          link: `/chat/${senderId}`,
        });

        // Emit to receiver if online
        const receiverSocket = onlineUsers.get(receiverId);
        if (receiverSocket) {
          io.to(receiverSocket).emit('receiveMessage', message);
          io.to(receiverSocket).emit('newNotification');
        }

        // Emit back to sender to confirm
        socket.emit('messageSent', message);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('disconnect', () => {
      onlineUsers.forEach((socketId, userId) => {
        if (socketId === socket.id) onlineUsers.delete(userId);
      });
      console.log('User disconnected:', socket.id);
    });
  });
};