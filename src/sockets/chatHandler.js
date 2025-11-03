const { Message } = require('../models');
const {getUnreadCount,getTotalUnreadCount  } = require('../utils/unreadHelper')

module.exports = (io, socket) => {
  socket.on('sendMessage', async (data) => {
    try {
      const { chatId, senderId, receiverId, content } = data;

      if (!chatId) throw new Error("ChatId required");
      if (!receiverId) throw new Error("Receiver Id required");
      if (!senderId) throw new Error("Sender Id required");
      if (!content) throw new Error("Content required");

      const message = await Message.create({
        chatId,
        senderId,
        receiverId,
        content,
      });
      await message.reload(); 
      
      io.to(chatId.toString()).emit('receiveMessage', message );

      console.log("message sent to chat room", chatId);

      console.log("Message received on backend ", data);
      
      socket.emit('message_saved', message);

      // ----unread count of specific chat
      const unreadCount = await getUnreadCount(chatId, receiverId);
      socket.to(receiverId.toString()).emit('updateUnreadCount', { chatId, unreadCount });

      // ---- unread messages of all chats
      const totalUnreadMessages = await getTotalUnreadCount(receiverId);
      io.to(receiverId.toString()).emit('updateTotalUnread', { totalUnreadMessages });

      
    } catch (err) {
      console.error('Message save error:', err);
      socket.emit('error_message', { error: err.message });
    }
  });


          // --------mark read in chats---------------
    
    socket.on("markChatAsRead", async ({ chatId, userId }) => {
            console.log ("✅Chat mark as read");
  try {
    if (!chatId || !userId) return;

    const unread = await Message.count({
      where: { chatId, receiverId: userId, isRead: false },
    });

    if (unread > 0) {
      await Message.update(
        { isRead: true },
        { where: { chatId, receiverId: userId, isRead: false } }
      );
      console.log("✅Chat mark as read");
      const totalUnreadMessages = await getTotalUnreadCount(userId);
      io.to(userId.toString()).emit("updateTotalUnread", { totalUnreadMessages });

      io.to(userId.toString()).emit("updateUnreadCount", {
        chatId,
        unreadCount: 0,
      });
    }
  } catch (err) {
    console.error("Error marking chat as read:", err);
    socket.emit("error_message", { error: err.message });
  }
});


};






