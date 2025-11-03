'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Jobs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      location: {
        type: Sequelize.STRING
      },
      experience: {
        type: Sequelize.INTEGER
      },
      salaryMin: {
        type: Sequelize.INTEGER
      },
      salaryMax: {
        type: Sequelize.INTEGER
      },
      jobType: {
        type: Sequelize.ENUM('fulltime', 'parttime', 'internship', 'remote', 'temporary')
      },
      postedBy:{
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE'
      },
      industryId:{
        type: Sequelize.INTEGER,
        onDelete: 'SET NULL'
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
    await queryInterface.dropTable('Jobs');
  }
};