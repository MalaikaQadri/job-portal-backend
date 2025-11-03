'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('StructuredResumes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      fullname: {
        type: Sequelize.STRING
      },
      title: {
        type: Sequelize.STRING
      },
      gender: {
        type: Sequelize.ENUM('male', 'female')
      },
      degree: {
        type: Sequelize.STRING
      },
      institute: {
        type: Sequelize.STRING
      },
      experience: {
        type: Sequelize.TEXT
      },
      projects: {
        type: Sequelize.TEXT
      },
      location: {
        type: Sequelize.STRING
      },
      phonenumber: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      personalwebsite: {
        type: Sequelize.STRING
      },
      biography: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('StructuredResumes');
  }
};