'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AIResumeMatchScore extends Model {
    static associate(models) {
      AIResumeMatchScore.belongsTo(models.User,
        {
          foreignKey:'userId',
          as:'applicant'
        }
      );
      AIResumeMatchScore.belongsTo(models.Job,
        {
          foreignKey:'jobId',
          as:'job'
        }
      );
    }
  }
  AIResumeMatchScore.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    skillsMatchScore: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0
    },
    experienceMatchScore: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0
    },
    educationMatchScore: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: 0
    },
    totalMatchScore: {
      type: DataTypes.STRING,
      allowNull:true,
      defaultValue: 0
    },
  }, {
    sequelize,
    modelName: 'AIResumeMatchScore',
  });
  return AIResumeMatchScore;
};