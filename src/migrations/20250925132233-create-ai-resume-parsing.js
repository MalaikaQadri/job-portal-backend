'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('AIResumeParsings', {
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
      name: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      phone: {
        type: Sequelize.STRING
      },
      skills: {
        type: Sequelize.STRING
      },
      education: {
        type: Sequelize.STRING
      },
      experience: {
        type: Sequelize.STRING
      },
      projects: {
        type: Sequelize.STRING
      },
      certifications: {
        type: Sequelize.STRING
      },
      skillMatchScore: {
        type: Sequelize.STRING
      },
      experienceMatchScore: {
        type: Sequelize.STRING
      },
      educationMatchScore: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('AIResumeParsings');
  }
};