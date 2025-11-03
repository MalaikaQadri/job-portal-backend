'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Messages', 'chatId', {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Messages', 'chatId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
