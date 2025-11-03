'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ConatactUs extends Model {
    static associate(models) {
      // define association here
    }
  }
  ConatactUs.init({
    title: {
      type: DataTypes.STRING,
      allowNull:false
    },
    heading: {
      type: DataTypes.STRING,
      allowNull:false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
  }, {
    sequelize,
    modelName: 'ConatactUs',
  });
  return ConatactUs;
};