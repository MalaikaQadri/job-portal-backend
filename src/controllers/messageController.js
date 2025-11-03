
const { Message } = require("../models");
const { getTotalUnreadCount } = require("../utils/unreadHelper");




// const getMessages = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const currentUserId = String(req.user.id);

//     const messages = await Message.findAll({
//       where: { chatId },
//       order: [["createdAt", "ASC"]],
//     });

//     // Ensure deletedFor is properly parsed
//     const visibleMessages = messages.filter((msg) => {
//       let deletedFor = [];

//       // handle both JSON array and string cases safely
//       if (msg.deletedFor) {
//         if (typeof msg.deletedFor === "string") {
//           try {
//             deletedFor = JSON.parse(msg.deletedFor);
//           } catch {
//             deletedFor = [];
//           }
//         } else if (Array.isArray(msg.deletedFor)) {
//           deletedFor = msg.deletedFor;
//         }
//       }

//       // only show messages not deleted for this user
//       return !deletedFor.includes(currentUserId) && !deletedFor.includes(Number(currentUserId));
//     });

//     const formattedMessages = visibleMessages.map((msg) => {
//       const messageData = msg.toJSON();
//       return {
//         ...messageData,
//         isSender: Number(messageData.senderId) === Number(req.user.id),
//       };
//     });

//     return res.status(200).json({ success: true, messages: formattedMessages });
//   } catch (err) {
//     console.error("Error fetching messages:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };

const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const currentUserId = Number(req.user.id);

    const messages = await Message.findAll({
      where: { chatId },
      order: [["createdAt", "ASC"]],
    });

    const visibleMessages = messages.filter((msg) => {
      let deletedFor = [];

      if (msg.deletedFor) {
        if (typeof msg.deletedFor === "string") {
          try {
            deletedFor = JSON.parse(msg.deletedFor);
          } catch {
            deletedFor = [];
          }
        } else {
          deletedFor = msg.deletedFor;
        }
      }

      return !deletedFor.includes(currentUserId);
    });

    const formattedMessages = visibleMessages.map((msg) => ({
      ...msg.toJSON(),
      isSender: msg.senderId === currentUserId,
    }));

    return res.status(200).json({ success: true, messages: formattedMessages });
  } catch (err) {
    console.error("Error fetching messages:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};





// const getMessages = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const currentUserId = String(req.user.id); 

//     const messages = await Message.findAll({
//       where: { chatId },
//       order: [["createdAt", "ASC"]],
//     });

//     const formattedMessages = messages.map((msg) => {
//       const messageData = msg.toJSON();
//       return {
//         ...messageData,
//         isSender: Number(messageData.senderId) === Number(req.user.id),
//       };
//     });

//     return res.status(200).json({ success: true, messages: formattedMessages });
//   } catch (err) {
//     console.error("Error fetching messages:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };


const deleteMessage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { messageId } = req.params;

    const message = await Message.findByPk(messageId);

    if (!message) return res.status(404).json({ success: false, message: "Message not found" });

    if (message.senderId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    await message.destroy();
    res.status(200).json({ success: true, message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const deleteAllMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    const messages = await Message.findAll({ where: { chatId } });

    for (const msg of messages) {
      let deletedFor = Array.isArray(msg.deletedFor) ? [...msg.deletedFor] : [];

      if (!deletedFor.includes(userId)) {
        deletedFor.push(userId);
        await msg.update({ deletedFor });
      }
    }

    return res.status(200).json({
      success: true,
      message: "All messages cleared for you only. Chat still visible.",
    });
  } catch (err) {
    console.error("Error deleting all messages:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

const getTotalUnreadMessages = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // const totalUnreadMessages = await Message.count({
    //   where: {
    //     receiverId: userId,
    //     isRead: false,
    //   },
    // });

    const totalUnreadMessages = await getTotalUnreadCount(userId);

    const unreadChats = await Message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
      distinct: true,
      col: "chatId",
    });

    return res.status(200).json({
      success: true,
      totalUnreadMessages,
      unreadChats,
    });
  } catch (error) {
    console.error("Error fetching unread message count:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// const deleteAllMessages = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const userId = String(req.user.id);

//     const messages = await Message.findAll({ where: { chatId } });

//     if (!messages.length) {
//       return res.status(404).json({ success: false, message: "No messages found" });
//     }

//     for (const msg of messages) {
//       let deletedFor = msg.deletedFor || [];
//       if (!deletedFor.includes(userId)) {
//         deletedFor.push(userId);
//         await msg.update({ deletedFor });
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message: "All messages cleared for you only. Chat still visible.",
//     });
//   } catch (err) {
//     console.error("Error clearing messages:", err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// };


module.exports = { getMessages, deleteMessage,deleteAllMessages,getTotalUnreadMessages };

