'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {

      Chat.belongsTo(models.User, { foreignKey: "senderId", as: "sender" });
      Chat.belongsTo(models.User, { foreignKey: "receiverId", as: "receiver" });
      Chat.hasMany(models.Message, { foreignKey: "chatId", as: "messages" });
      Chat.hasOne(models.Message, {
  foreignKey: "chatId",
  as: "lastMessage",
});


    }
  }
  Chat.init({
    chatId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      unique: true,
      primaryKey: true,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull:false
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    deletedFor: {
  type: DataTypes.JSON,
  allowNull: true,
  defaultValue: [],
},

  }, {
    sequelize,
    modelName: 'Chat',
  });
  return Chat;
};