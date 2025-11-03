const { Chat, Message, User } = require("../models");
const { Op, Sequelize, sequelize } = require("sequelize");
const { getUnreadCount } = require("../utils/unreadHelper");


// const createChatRoom = async (req, res) => {
//   try {
//     const senderId = req.user.id;
//     const { receiverId } = req.body;

//     if (!receiverId) {
//       return res.status(400).json({
//         success: false,
//         message: "Receiver ID is required",
//       });
//     }

//     if (parseInt(receiverId) === parseInt(senderId)) {
//       return res.status(400).json({
//         success: false,
//         message: "You cannot create a chat with yourself.",
//       });
//     }

//     const receiver = await User.findByPk(receiverId);
//     if (!receiver) {
//       return res.status(404).json({
//         success: false,
//         message: "Receiver not found. Cannot create chat.",
//       });
//     }

//     let chat = await Chat.findOne({
//       where: {
//         [Op.or]: [
//           { senderId, receiverId },
//           { senderId: receiverId, receiverId: senderId },
//         ],
//       },
//     });

//     if (!chat) {
//       chat = await Chat.create({ senderId, receiverId });
//     }

//     return res.status(201).json({
//       success: true,
//       message: chat._options.isNewRecord ? "Chat created successfully" : "Chat already exists",
//       chat,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

const createChatRoom = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    if (parseInt(receiverId) === parseInt(senderId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot create a chat with yourself.",
      });
    }

    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: "Receiver not found. Cannot create chat.",
      });
    }

    let chat = await Chat.findOne({
      where: {
        [Op.or]: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (chat) {
      let deletedFor = [];
      if (chat.deletedFor) {
        try {
          deletedFor = JSON.parse(chat.deletedFor);
        } catch {
          deletedFor = [];
        }
      }

      if (deletedFor.includes(senderId)) {
        const updated = deletedFor.filter(id => id !== senderId);
        await chat.update({ deletedFor: JSON.stringify(updated) });
      }

      return res.status(200).json({
        success: true,
        message: "Chat restored or already exists",
        chat,
      });
    }

    chat = await Chat.create({
      senderId,
      receiverId,
      deletedFor: JSON.stringify([]),
    });

    return res.status(201).json({
      success: true,
      message: "New chat created successfully",
      chat,
    });

  } catch (err) {
    console.error("Error creating chat:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};




// const getUserChats = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const currentUser = await User.findByPk(userId, {
//       attributes: ["id", "blockedUsers"],
//     });

//     const chats = await Chat.findAll({
//       where: {
//         [Op.or]: [{ senderId: userId }, { receiverId: userId }],
//       },
//       include: [
//         {
//           model: User,
//           as: "sender",
//           attributes: ["id", "fullName", "profilepic", "blockedUsers", "lastSeen"],
//         },
//         {
//           model: User,
//           as: "receiver",
//           attributes: ["id", "fullName", "profilepic", "blockedUsers", "lastSeen"],
//         },
//         {
//           model: Message,
//           as: "messages",
//           attributes: ["senderId", "receiverId", "content", "createdAt"],
//           separate: true,
//           order: [["createdAt", "DESC"]],
//           limit: 1,
//         },
//       ],
//       order: [
//         [
//           Sequelize.literal(`(
//             SELECT "createdAt"
//             FROM "Messages"
//             WHERE "Messages"."chatId" = "Chat"."chatId"
//             ORDER BY "createdAt" DESC
//             LIMIT 1
//           )`),
//           "DESC",
//         ],
//       ],
//     });

//     const baseUrl = `${req.protocol}://${req.get("host")}`;

//     const visibleChats = chats.filter((chat) => {
//       const deletedFor = Array.isArray(chat.deletedFor) ? chat.deletedFor : [];
//       return !deletedFor.includes(userId);
//     });

//     const formattedChats = await Promise.all(
//       visibleChats.map(async (chat) => {
//         const otherUser =
//           chat.senderId === userId ? chat.receiver : chat.sender;

//         let profileUrl = null;
//         if (otherUser?.profilepic) {
//           let pic = otherUser.profilepic.trim();
//           if (pic.includes("http://") || pic.includes("https://")) {
//             pic = pic.split("/").pop();
//           }
//           profileUrl = `${baseUrl}/images/${pic}`;
//         }

//         const blockedByCurrentUser =
//           currentUser.blockedUsers?.includes(otherUser?.id) || false;

//         const lastMessage = chat.messages[0] || null;

//         const unreadCount = await Message.count({
//           where: {
//             chatId: chat.chatId,
//             receiverId: userId,
//             isRead: false,
//           },
//         });

//         return {
//           chatId: chat.chatId,
//           senderId: chat.senderId,
//           receiverId: chat.receiverId,
//           createdAt: chat.createdAt,
//           updatedAt: chat.updatedAt,
//           receiver: {
//             id: otherUser?.id || null,
//             fullName: otherUser?.fullName || null,
//             profilepic: profileUrl,
//             blockedByCurrentUser,
//           },
//           lastMessage: lastMessage
//             ? {
//                 senderId: lastMessage.senderId,
//                 receiverId: lastMessage.receiverId,
//                 content: lastMessage.content,
//                 createdAt: lastMessage.createdAt,
//               }
//             : null,
//           unreadCount, 
//         };
//       })
//     );

//     formattedChats.sort((a, b) => {
//       const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
//       const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
//       return bTime - aTime;
//     });

//     res.status(200).json({
//       success: true,
//       chats: formattedChats,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };

const getChatByUserId = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userId: otherUserId } = req.params;

    let chat = await Chat.findOne({
      where: {
        [Op.or]: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "fullName", "profilepic", "blockedUsers", "lastSeen"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "fullName", "profilepic", "blockedUsers", "lastSeen"],
        },
        {
          model: Message,
          as: "messages",
          attributes: ["senderId", "receiverId", "content", "createdAt"],
          order: [["createdAt", "ASC"]],
        },
      ],
    });

    if (!chat) {
      chat = await Chat.create({
        senderId: userId,
        receiverId: otherUserId,
      });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
      const otherUser = chat.senderId === userId? chat.receiver : chat.sender;
    let profileUrl = null;
    if (otherUser?.profilepic) {
      let pic = otherUser.profilepic.trim();
      if (pic.includes("http://") || pic.includes("https://")) {
        pic = pic.split("/").pop();
      }
      profileUrl = `${baseUrl}/images/${pic}`;
    }

    const blockedByCurrentUser = req.user.blockedUsers?.includes(otherUser?.id) || false;

    res.status(200).json({
      success: true,
      chat: {
        chatId: chat.chatId,
        senderId: chat.senderId,
        receiverId: chat.receiverId,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        receiver: {
          id: otherUser?.id || null,
          fullName: otherUser?.fullName || null,
          profilepic: profileUrl,
          blockedByCurrentUser,
        },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const blockUnblockUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { blockedUserId, type } = req.body;

    if (!blockedUserId || !['block', 'unblock'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid request. Use type: 'block' or 'unblock'.",
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let blockedUsers = Array.isArray(user.blockedUsers) ? [...user.blockedUsers] : [];

    if (type === 'block') {
      if (!blockedUsers.includes(blockedUserId)) {
        blockedUsers.push(blockedUserId);
      }
    } else if (type === 'unblock') {
      blockedUsers = blockedUsers.filter(id => id !== blockedUserId);
    }

    user.setDataValue('blockedUsers', blockedUsers);
    user.changed('blockedUsers', true);
    await user.save({ fields: ['blockedUsers'] });

    res.status(200).json({
      success: true,
      message: `User successfully ${type}ed.`,
      blockedUsers,
    });
  } catch (err) {
    console.error('Error updating block status:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// const deleteChat = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { chatId } = req.params;

//     const chat = await Chat.findOne({ where: { chatId } });

//     if (!chat) {
//       return res.status(404).json({ success: false, message: "Chat not found" });
//     }

//     if (chat.senderId !== userId && chat.receiverId !== userId) {
//       return res.status(403).json({ success: false, message: "Not authorized to delete this chat" });
//     }

//     let deletedFor = chat.deletedFor || [];

//     if (typeof deletedFor === "string") {
//       try {
//         deletedFor = JSON.parse(deletedFor);
//       } catch {
//         deletedFor = [];
//       }
//     }

//     if (!deletedFor.includes(userId)) {
//       deletedFor.push(userId);
//     }

//     if (deletedFor.includes(chat.senderId) && deletedFor.includes(chat.receiverId)) {
//       await Message.destroy({ where: { chatId } });
//       await chat.destroy();
//       return res.status(200).json({ success: true, message: "Chat permanently deleted" });
//     }

//     await chat.update({ deletedFor });

//     return res.status(200).json({ success: true, message: "Chat deleted for current user only" });
//   } catch (err) {
//     console.error("Error deleting chat:", err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


// const deleteChat = async (req, res) => {
//   try {
//     const userId = req.user.id; 
//     const { chatId } = req.params; 

//     const chat = await Chat.findOne({ where: { chatId } });
//     if (!chat) {
//       return res.status(404).json({ success: false, message: "Chat not found" });
//     }

//     if (chat.senderId !== userId && chat.receiverId !== userId) {
//       return res.status(403).json({ success: false, message: "Not authorized to delete this chat" });
//     }

//     await Message.destroy({ where: { chatId } });

//     await chat.destroy();

//     return res.status(200).json({ success: true, message: "Chat deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };


const markChatAsRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id; 

    await Message.update(
      { isRead: true },
      {
        where: {
          chatId,
          receiverId: userId,
          isRead: false
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Chat marked as read successfully.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// i have make markchat read api but i want k user jab chat may enter hoo uss k vo messages read hoo jaen or ussi chat may agar chara hy tu markchat read hoo jaey instant like in whatsapp tu may nay event tu bana lia hy magar uss ki api may bhi lagana hy kya karna hy ya batao 


const deleteChat = async (req, res) => {
  try {
    const userId = req.user.id;
    const { chatId } = req.params;

    const chat = await Chat.findOne({ where: { chatId } });

    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found" });
    }

    if (chat.senderId !== userId && chat.receiverId !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to delete this chat" });
    }

    let deletedFor = [];
    if (chat.deletedFor) {
      try {
        deletedFor = JSON.parse(chat.deletedFor);
      } catch (e) {
        deletedFor = [];
      }
    }

    if (!deletedFor.includes(userId)) {
      deletedFor.push(userId);
    }

    // ✅ If both users deleted — delete all messages & chat permanently
    if (deletedFor.includes(chat.senderId) && deletedFor.includes(chat.receiverId)) {
      await Message.destroy({ where: { chatId } });
      await chat.destroy();
      return res.status(200).json({
        success: true,
        message: "Chat permanently deleted for both users",
      });
    }

    // ✅ Otherwise, save deletedFor as JSON string
    await chat.update({ deletedFor: JSON.stringify(deletedFor) });

    return res.status(200).json({
      success: true,
      message: "Chat deleted for current user only",
    });
  } catch (err) {
    console.error("Error deleting chat:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// const getUserChats = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const currentUser = await User.findByPk(userId, {
//       attributes: ["id", "blockedUsers"],
//     });

//     const chats = await Chat.findAll({
//       where: {
//         [Op.or]: [{ senderId: userId }, { receiverId: userId }],
//       },
//       include: [
//         {
//           model: User,
//           as: "sender",
//           attributes: ["id", "fullName", "profilepic", "blockedUsers", "lastSeen"],
//         },
//         {
//           model: User,
//           as: "receiver",
//           attributes: ["id", "fullName", "profilepic", "blockedUsers", "lastSeen"],
//         },
//         {
//           model: Message,
//           as: "messages",
//           attributes: ["senderId", "receiverId", "content", "createdAt"],
//           separate: true,
//           order: [["createdAt", "DESC"]],
//           limit: 1,
//         },
//       ],
//       order: [
//         [
//           Sequelize.literal(`(
//             SELECT "createdAt"
//             FROM "Messages"
//             WHERE "Messages"."chatId" = "Chat"."chatId"
//             ORDER BY "createdAt" DESC
//             LIMIT 1
//           )`),
//           "DESC",
//         ],
//       ],
//     });

//     const baseUrl = `${req.protocol}://${req.get("host")}`;

//     // ✅ Filter chats that are NOT deleted for this user
//     const visibleChats = chats.filter((chat) => {
//       let deletedFor = [];
//       if (chat.deletedFor) {
//         try {
//           deletedFor = JSON.parse(chat.deletedFor);
//         } catch {
//           deletedFor = [];
//         }
//       }
//       return !deletedFor.includes(userId);
//     });

//     const formattedChats = await Promise.all(
//       visibleChats.map(async (chat) => {
//         const otherUser = chat.senderId === userId ? chat.receiver : chat.sender;

//         let profileUrl = null;
//         if (otherUser?.profilepic) {
//           let pic = otherUser.profilepic.trim();
//           if (pic.includes("http://") || pic.includes("https://")) {
//             pic = pic.split("/").pop();
//           }
//           profileUrl = `${baseUrl}/images/${pic}`;
//         }

//         const blockedByCurrentUser =
//           currentUser.blockedUsers?.includes(otherUser?.id) || false;

//         const lastMessage = chat.messages[0] || null;

//         const unreadCount = await Message.count({
//           where: {
//             chatId: chat.chatId,
//             receiverId: userId,
//             isRead: false,
//           },
//         });

//         return {
//           chatId: chat.chatId,
//           senderId: chat.senderId,
//           receiverId: chat.receiverId,
//           createdAt: chat.createdAt,
//           updatedAt: chat.updatedAt,
//           receiver: {
//             id: otherUser?.id || null,
//             fullName: otherUser?.fullName || null,
//             profilepic: profileUrl,
//             blockedByCurrentUser,
//           },
//           lastMessage: lastMessage
//             ? {
//                 senderId: lastMessage.senderId,
//                 receiverId: lastMessage.receiverId,
//                 content: lastMessage.content,
//                 createdAt: lastMessage.createdAt,
//               }
//             : null,
//           unreadCount,
//         };
//       })
//     );

//     // ✅ Sort by latest message
//     formattedChats.sort((a, b) => {
//       const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
//       const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
//       return bTime - aTime;
//     });

//     res.status(200).json({
//       success: true,
//       chats: formattedChats,
//     });
//   } catch (err) {
//     console.error("Error fetching chats:", err);
//     res.status(500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };


const getUserChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const currentUser = await User.findByPk(userId, {
      attributes: ["id", "blockedUsers"],
    });

    const chats = await Chat.findAll({
      where: {
        [Op.or]: [{ senderId: userId }, { receiverId: userId }],
      },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "fullName", "profilepic", "blockedUsers", "lastSeen"],
        },
        {
          model: User,
          as: "receiver",
          attributes: ["id", "fullName", "profilepic", "blockedUsers", "lastSeen"],
        },
        // {
        //   model: Message,
        //   as: "messages",
        //   attributes: ["id", "senderId", "receiverId", "content", "createdAt", "deletedFor"],
        //   separate: true,
        //   order: [["createdAt", "DESC"]],
        // },

        {
  model: Message,
  as: "lastMessage",
  required: false,
  where: Sequelize.literal(`
    "lastMessage"."createdAt" = (
      SELECT MAX("m"."createdAt")
      FROM "Messages" AS m
      WHERE m."chatId" = "Chat"."chatId"
      AND (
        m."deletedFor" IS NULL
        OR NOT (m."deletedFor"::jsonb @> '[${userId}]')
      )
    )
  `),
  attributes: ["senderId", "receiverId", "content", "createdAt"],
},

        

      ],
      order: [
        [
          Sequelize.literal(`(
            SELECT "createdAt"
            FROM "Messages"
            WHERE "Messages"."chatId" = "Chat"."chatId"
            ORDER BY "createdAt" DESC
            LIMIT 1
          )`),
          "DESC",
        ],
      ],
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const visibleChats = chats.filter((chat) => {
      let deletedFor = [];
      if (chat.deletedFor) {
        try {
          deletedFor = JSON.parse(chat.deletedFor);
        } catch {
          deletedFor = [];
        }
      }
      return !deletedFor.includes(userId);
    });

    const formattedChats = await Promise.all(
      visibleChats.map(async (chat) => {
        const otherUser = chat.senderId === userId ? chat.receiver : chat.sender;

        let profileUrl = null;
        if (otherUser?.profilepic) {
          let pic = otherUser.profilepic.trim();
          if (pic.includes("http://") || pic.includes("https://")) {
            pic = pic.split("/").pop();
          }
          profileUrl = `${baseUrl}/images/${pic}`;
        }

        const blockedByCurrentUser =
          currentUser.blockedUsers?.includes(otherUser?.id) || false;

        // const visibleMessages = chat.messages.filter((msg) => {
        //   if (!msg.deletedFor) return true;
        //   try {
        //     const deletedFor = JSON.parse(msg.deletedFor);
        //     return !deletedFor.includes(userId);
        //   } catch {
        //     return true;
        //   }
        // });
          const lastMessage = chat.lastMessage || null;

        // const lastMessage = visibleMessages[0] || null;

        // const unreadCount = await Message.count({
        //   where: {
        //     chatId: chat.chatId,
        //     receiverId: userId,
        //     isRead: false,
        //   },
        // });
        // const unreadCount = await getUnreadCount(chatId, receiverId);
        const unreadCount = await getUnreadCount(chat.chatId, userId);

        return {
          chatId: chat.chatId,
          senderId: chat.senderId,
          receiverId: chat.receiverId,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          receiver: {
            id: otherUser?.id || null,
            fullName: otherUser?.fullName || null,
            profilepic: profileUrl,
            blockedByCurrentUser,
          },
          lastMessage: lastMessage
            ? {
                senderId: lastMessage.senderId,
                receiverId: lastMessage.receiverId,
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
              }
            : null,
          unreadCount,
        };
      })
    );

    formattedChats.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    res.status(200).json({
      success: true,
      chats: formattedChats,
    });
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};






module.exports = { createChatRoom, getUserChats, blockUnblockUser, deleteChat,  getChatByUserId, markChatAsRead, };
