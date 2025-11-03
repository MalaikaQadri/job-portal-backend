'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AIResumeMatchScores', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER
      },
      jobId: {
        type: Sequelize.INTEGER
      },
      skillsMatchScore: {
        type: Sequelize.FLOAT
      },
      experienceMatchScore: {
        type: Sequelize.FLOAT
      },
      educationMatchScore: {
        type: Sequelize.FLOAT
      },
      totalMatchScore: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('AIResumeMatchScores');
  }
};