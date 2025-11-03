'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class StructuredResume extends Model {
    static associate(models) {
      StructuredResume.belongsTo(models.User, { 
        foreignKey: 'userId',
        onDelete: 'CASCADE'
      });
    }
  }
  StructuredResume.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull:false,
      unique: true,
       references: {
        model: 'Users', 
        key: 'id'
      }
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull:false
    },
    gender: {
      type: DataTypes.ENUM('male', 'female'),
      allowNull: false,
    },
    degree: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    institute: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    projects: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    phonenumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    personalwebsite: {
      type: DataTypes.STRING,
      allowNull: true,
       validate: 
       { isUrl: true }
    },
    biography: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    skills:{
      type: DataTypes.TEXT,
      allowNull:false,
      defaultValue:'N/A'
    },


  }, {
    sequelize,
    modelName: 'StructuredResume',
  });
  return StructuredResume;
};

