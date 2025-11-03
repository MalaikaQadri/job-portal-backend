'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.addColumn('Jobs', 'status',
         {
          type:Sequelize.ENUM('active', 'expired'),
          allowNull:false,
          defaultValue:'active',
            }); 
  },

  async down (queryInterface, Sequelize) {
      await queryInterface.removeColumn('Jobs', 'status');
     
  }
};
