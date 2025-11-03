'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Application extends Model {
    static associate(models) {


      Application.belongsTo(models.User,{
        foreignKey: 'userId',
        as: 'applicant',
        onDelete: 'CASCADE'
      });

      Application.belongsTo(models.Job,{
        foreignKey:'jobId',
        as: 'job',
        onDelete:'CASCADE'
      });
    }
  }
  Application.init({
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    jobId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references:{
        model: 'Jobs',
        key: 'id'
      },
      onDelete:'CASCADE'
    },
    coverLetter: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending'
    },
    appliedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
  }, {
    sequelize,
    modelName: 'Application',
    timestamps: true,
  });
  return Application;
};

