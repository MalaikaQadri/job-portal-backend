'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Jobs', 'tags', {
      type: Sequelize.ARRAY(Sequelize.STRING), 
      allowNull: true
    });

    await queryInterface.addColumn('Jobs', 'education', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('Jobs', 'jobExpirationDate', {
      type: Sequelize.DATE,
      allowNull: true
    });

    await queryInterface.addColumn('Jobs', 'description', {
      type: Sequelize.TEXT,
      allowNull: false
    });

    await queryInterface.addColumn('Jobs', 'responsibilities', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Jobs', 'tags');
    await queryInterface.removeColumn('Jobs', 'education');
    await queryInterface.removeColumn('Jobs', 'jobExpirationDate');
    await queryInterface.removeColumn('Jobs', 'description');
    await queryInterface.removeColumn('Jobs', 'responsibilities');
  }
};
