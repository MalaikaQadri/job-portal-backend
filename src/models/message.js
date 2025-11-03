'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {

    static associate(models) {
      
      Message.belongsTo(models.Chat, { foreignKey: "chatId", as: "chat" });
      Message.belongsTo(models.User, { foreignKey: "senderId", as: "sender" });
      Message.belongsTo(models.User, { foreignKey: "receiverId", as: "receiver" });

    }
  }
  Message.init({
    chatId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Chats",
        key: "chatId"
      },
      onDelete: "CASCADE"
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isRead: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
},
deletedFor: {
  type: DataTypes.JSON,
  defaultValue: [],
},

  }, {
    sequelize,
    modelName: 'Message',
  });
  return Message;
};