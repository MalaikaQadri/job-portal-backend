'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('Chats', 'user1Id', 'senderId');
    await queryInterface.renameColumn('Chats', 'user2Id', 'receiverId');
  },

  async down(queryInterface, Sequelize) {
    // revert changes if you rollback
    await queryInterface.renameColumn('Chats', 'senderId', 'user1Id');
    await queryInterface.renameColumn('Chats', 'receiverId', 'user2Id');
  }
};
