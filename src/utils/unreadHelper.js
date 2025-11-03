const { Message, sequelize  } = require('../models');
const { Op } = require('sequelize');

async function getUnreadCount(chatId, receiverId) {
  return await Message.count({
    where: {
      chatId,
      receiverId,
      isRead: false,
      [Op.or]: [
        { deletedFor: null },
        sequelize.literal(`NOT (("deletedFor"::jsonb) @> '[${receiverId}]')`)
      ],
    },
  });
}


async function getTotalUnreadCount(userId) {
  if (!userId) throw new Error("userId is required");

  const totalUnreadMessages = await Message.count({
    where: {
      receiverId: userId,
      isRead: false
    }
  });

  return totalUnreadMessages;
}

module.exports = { getUnreadCount, getTotalUnreadCount };
