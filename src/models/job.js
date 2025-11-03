'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Job extends Model {
    static associate(models) {

      Job.belongsTo(models.Industry, {
        foreignKey: 'industryId',
        as:'industry'
      });

      Job.belongsTo(models.User,{
        foreignKey:'postedBy',
        as:'recruiter'
      });

      Job.hasMany(models.SavedJob,{
        foreignKey: 'jobId',
        as:'savedByUsers'
      });
      
      Job.hasMany(models.Application,{
        foreignKey: 'jobId',
        as: 'applications',
        onDelete: 'CASCADE'
      });
      
      Job.belongsTo(models.Location, {
         foreignKey: 'locationId',
         as: 'location'
});
Job.hasMany(models.Notification, {
  foreignKey: "jobId",
  as: "notifications",
  onDelete: "SET NULL",
});

    }
  }
  Job.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
       references: {
         model: 'Locations',
         key: 'id'
     }
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    salaryMin: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    salaryMax: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    jobType: {
      type: DataTypes.ENUM('fulltime', 'parttime', 'internship', 'remote', 'temporary')
    },
    postedBy: {
        type: DataTypes.INTEGER,
        allowNull:false,
        references:{
          model:'Users',
          key:'id'
        }
    },
    industryId:{
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tags: { 
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    education: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    jobExpirationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    views:{
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    responsibilities: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status:{
      type:DataTypes.ENUM('active', 'expired'),
      defaultValue:'active',
    },
    approvalStatus:{
      type: DataTypes.STRING,
      allowNull:false,
      defaultValue:'pending'
    },
    }, {
    sequelize,
    modelName: 'Job',
  });
  
  return Job;
};