'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AboutUs extends Model {
    static associate(models) {
      // define association here
    }
  }
  AboutUs.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    heading: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description:{
      type: DataTypes.TEXT,
      allowNull: false
    },

  }, {
    sequelize,
    modelName: 'AboutUs',
  });
  return AboutUs;
};