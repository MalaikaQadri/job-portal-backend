'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {

    User.hasMany(models.Image, {
  foreignKey: "userId",
  as: "profileImage",
  scope: { mimetype: ["image/png", "image/jpeg", "image/jpg"] }, 
  onDelete: "CASCADE"
});

User.hasMany(models.Image, {
  foreignKey: "userId",
  as: "resumeFile",
  scope: { mimetype: ["application/pdf"] }, 
  onDelete: "CASCADE"
});

User.hasMany(models.Job,{
  foreignKey:'postedBy',
  as:'jobs',
  onDelete:'CASCADE'
});

User.hasMany(models.SavedJob,{
  foreignKey:'userId',
  as:'savedJobs',
  onDelete:'CASCADE'
});

User.hasMany(models.Application,{
  foreignKey:'userId',
  as: 'applications',
  onDelete: 'CASCADE'
});

User.hasMany(models.Chat,{
  foreignKey:"senderId",as:"user1Chats"
});

User.hasMany(models.Chat,{
foreignKey:"receiverId",as:"user2Chats"
});

User.hasMany(models.Message,{
  foreignKey:"senderId",as:"sentMessages"
});

User.hasMany(models.Message,{
  foreignKey:"receiverId",as:"receivedMessages"
});

User.hasMany(models.OAuthAccount, { 
  foreignKey: 'userId', as: 'oauthAccounts' });

  User.hasMany(models.Notification, {
  foreignKey: 'userId',
  as: 'notifications',
  onDelete: 'CASCADE',
});

// User.belongsTo(models.Industry, {
//   as: "industry",
//   foreignKey: "industryId",
// });


    }
  }
  User.init({
    fullName: {
    type: DataTypes.STRING,
    allowNull:false,
    validate:{
      notEmpty:true,
      len:[3,25]
    }
    },
    username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique:true,
    defaultValue: 'guest',
    validate:{
      notEmpty:true,
      len:[3,25]
    }
    },
    email:{
    type:  DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate:{
      isEmail:true,
      len:[8,100]
    }
    },
    password: {
      type: DataTypes.STRING,
      allowNull:true
    },
    role:{
    type: DataTypes.ENUM('applicant', 'recruiter','admin' ),
    }, 
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    },
    isEmailVerified:{
      type:DataTypes.BOOLEAN,
      defaultValue:false
    },
    is2FAEnabled:{
      type: DataTypes.BOOLEAN,
      defaultValue:false
    },
    otpCode: {
     type: DataTypes.STRING,
     allowNull: true
    },
    otpExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    otpVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    otpType:{
      type: DataTypes.STRING,
      allowNull:true
    },
    token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tokenExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    secret: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "" 
    },
    twofaBackupcode: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []  
    },
    title: {
      type: DataTypes.STRING,
      allowNull:false,
      defaultValue: "Not Provided" 
    },
    experience: {
      type: DataTypes.TEXT,
      allowNull:false,
      defaultValue: "N/A" 
    },
    education: {
      type: DataTypes.TEXT,
      allowNull:false,
      defaultValue: "N/A"
    },
    personalwebsite: {
      type: DataTypes.STRING,
      allowNull:false,
      defaultValue: "https://example.com", 
      validate:{
        isUrl: true,
      },
    },
    bioGraphy:{
      type: DataTypes.TEXT,
      allowNull:true
    },
    profilepic: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resume: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location:{
      type: DataTypes.STRING,
      allowNull: true
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "0000000000" 
    },
    bannerImage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    companyName: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Not Provided"
    },
    aboutUs: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: "N/A"
    },
    organizationType: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "Not Provided"
    },
    teamSize: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "1-10"
    },
    // industryTypes: {
    //   type: DataTypes.STRING,
    //   allowNull: true,
    //   defaultValue: "General"
    // },

    industryTypes: {
        type: DataTypes.STRING, 
        allowNull: true,
        defaultValue: "General",
        references: {
          model: "Industries", 
          key: "id"
        },
        onDelete: "SET NULL",
      },
      lastSeen:{
        type: DataTypes.DATE,
        allowNull: true,   
        defaultValue: null,
      },
    blockedUsers: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [], 
    },
      fcmToken: {
        type: DataTypes.STRING,
        allowNull: true
      },
      deviceInfo: {
        type: DataTypes.STRING,
        allowNull: true
      },
    yearOfEstablishment: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    companyWebsite: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isUrl: true }
    },
    facebookLink: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isUrl: true }
    },
    instagramLink: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isUrl: true }
    },
    linkedInLink: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isUrl: true }
    },
    twitterLink: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isUrl: true }
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      }
  }, {
    sequelize,
    modelName: 'User',
    timestamps:true,
    paranoid:true
  });
  return User;
};