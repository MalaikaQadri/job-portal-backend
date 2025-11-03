'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.createTable('Users', 'deleteAt', 
        { 
          type: Sequelize.DATE,
          allowNull: true, 
        });
  },

  async down (queryInterface, Sequelize) {

      await queryInterface.dropTable('Users', 'deleteAt',{
      type: Sequelize.DATE,
      allowNull: false,
      });
     
  }
};
