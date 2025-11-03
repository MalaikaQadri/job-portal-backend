'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Messages', 'deletedFor', {
        type: Sequelize.JSON,
        defaultValue: [],
});

  },

  async down (queryInterface, Sequelize) {
      await queryInterface.removeColumn('Messages', 'deleteFor');
     
  }
};
