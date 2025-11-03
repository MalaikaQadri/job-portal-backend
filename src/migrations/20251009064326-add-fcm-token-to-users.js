'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'fcmToken', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await queryInterface.addColumn('Users', 'deviceInfo', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'fcmToken');
    await queryInterface.removeColumn('Users', 'deviceInfo');
  }
};
