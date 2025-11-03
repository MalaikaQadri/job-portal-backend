'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    static associate(models) {
      Location.hasMany(models.Job, {
          foreignKey: 'locationId',
          as: 'jobs',
          onDelete: 'CASCADE'
      });
    }
  }
  Location.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
  }, {
    sequelize,
    modelName: 'Location',
  });
  return Location;
};