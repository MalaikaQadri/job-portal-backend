'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Image extends Model {
    static associate(models) {
      
  Image.belongsTo(models.User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "CASCADE"
});
    }
  }
  Image.init({
    filename:{
      type: DataTypes.STRING,
      allowNull: false,
    },
    filepath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mimetype: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull:false,
    },
    userId:{
      type:DataTypes.INTEGER,
      allowNull:false
    }
  }, {
    sequelize,
    modelName: 'Image',
  });
  return Image;
};