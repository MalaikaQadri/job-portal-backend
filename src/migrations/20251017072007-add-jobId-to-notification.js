'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.addColumn('Notifications', 'jobId',
        { 
          type: Sequelize.INTEGER,
          references: { model: "Jobs", key: "id" },
           onDelete: "SET NULL",
         });
     
  },

  async down (queryInterface, Sequelize) {
      await queryInterface.removeColumn('Notifications', 'jobId');
     
  }
};
