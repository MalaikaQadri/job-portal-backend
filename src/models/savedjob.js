'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class SavedJob extends Model {
    static associate(models) {
      SavedJob.belongsTo(models.User, {
        foreignKey: 'userId',
        as:"user",
        onDelete: 'CASCADE'
      });

      SavedJob.belongsTo(models.Job,{
        foreignKey:'jobId',
        as: 'job',
        onDelete: 'CASCADE'
      });

    }
  }
  SavedJob.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'SavedJob',
    timestamps: true
  });
  return SavedJob;
};