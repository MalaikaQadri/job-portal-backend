'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Industry extends Model {
    static associate(models) {
      Industry.hasMany(models.Job, {
        foreignKey:'industryId',
        as:'jobs',
        onDelete: 'CASCADE'
      });
//       Industry.hasMany(models.User, {
//   as: "users",
//   foreignKey: "industryId",
// });

    
    }
  }
  Industry.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
  }, {
    sequelize,
    modelName: 'Industry',
  });
  return Industry;
};