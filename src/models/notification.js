'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
       Notification.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE',
      });
      Notification.belongsTo(models.Job, {  foreignKey: "jobId",as: "job", onDelete: 'SET NULL' });
    }
  }
  Notification.init({
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      data_payload: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      read_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
       jobId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'Jobs',
          key: 'id',
        },
        onDelete: 'SET NULL',
      },
  }, {
    sequelize,
    modelName: 'Notification',
       timestamps: true,
  });
  return Notification;
};