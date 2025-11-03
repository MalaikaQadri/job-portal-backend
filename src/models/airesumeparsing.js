'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AIResumeParsing extends Model {
    static associate(models) {
       AIResumeParsing.belongsTo(models.User,
        { 
          foreignKey:'userId', as:'applicant'
        }
       );
    }
  }
  AIResumeParsing.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull:true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    skills: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    education: {
      type: DataTypes.JSON,
      allowNull: true
    },
    experience: {
      type: DataTypes.JSON,
      allowNull: true
    },
    projects: {
      type: DataTypes.JSON,
      allowNull: true
    },
    certifications: {
      type: DataTypes.JSON,
      allowNull: true
    },
    resumeFile: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, {
    sequelize,
    modelName: 'AIResumeParsing',
  });
  return AIResumeParsing;
};