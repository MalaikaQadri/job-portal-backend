'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.addColumn('Jobs', 'views',
         { 
          type: Sequelize.INTEGER,
           defaultValue: 0,
           allowNull: false,
        });
     
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.removeColumn('Jobs', 'views');

  }
};
