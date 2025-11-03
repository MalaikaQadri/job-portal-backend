'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('Jobs');

    if (tableDesc.indstryId) {
      await queryInterface.renameColumn('Jobs', 'indstryId', 'industryId');
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDesc = await queryInterface.describeTable('Jobs');

    if (tableDesc.industryId) {
      await queryInterface.renameColumn('Jobs', 'industryId', 'indstryId');
    }
  }
};