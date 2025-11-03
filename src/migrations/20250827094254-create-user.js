'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      fullName: {
        type: Sequelize.STRING
      },
      username: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      role: {
        type: Sequelize.ENUM('applicant', 'recruiter')
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'banned')
      },
      isEmailVerified: {
        type: Sequelize.BOOLEAN
      },
      is2FAEnabled: {
        type: Sequelize.BOOLEAN
      },
      otpCode: {
        type: Sequelize.STRING
      },
      otpExpiresAt: {
        type: Sequelize.DATE
      },
      otpVerifiedAt: {
        type: Sequelize.DATE
      },
      token: {
        type: Sequelize.STRING
      },
      tokenExpiresAt: {
        type: Sequelize.STRING
      },
      secret: {
        type: Sequelize.STRING
      },
      twofaBackupcode: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      experience: {
        type: Sequelize.TEXT
      },
      education: {
        type: Sequelize.TEXT
      },
      personalwebsite: {
        type: Sequelize.STRING
      },
      profilepic: {
        type: Sequelize.STRING
      },
      resume: {
        type: Sequelize.STRING
      },
      location: {
        type: Sequelize.STRING
      },
      phoneNumber: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};