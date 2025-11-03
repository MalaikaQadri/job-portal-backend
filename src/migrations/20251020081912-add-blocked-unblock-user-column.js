'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'blockedUsers', {
      type: Sequelize.JSONB,
      allowNull: false,
      defaultValue: [], 
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'blockedUsers');
  },
};
