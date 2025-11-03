'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'secret', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ""
    });

    await queryInterface.changeColumn('Users', 'twofaBackupcode', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: []
    });

    await queryInterface.changeColumn('Users', 'title', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "Not Provided"
    });

    await queryInterface.changeColumn('Users', 'experience', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: "N/A"
    });

    await queryInterface.changeColumn('Users', 'education', {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: "N/A"
    });

    await queryInterface.changeColumn('Users', 'personalwebsite', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "https://example.com"
    });

    await queryInterface.changeColumn('Users', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "0000000000"
    });

    await queryInterface.changeColumn('Users', 'username', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "guest"
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'secret', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('Users', 'twofaBackupcode', {
      type: Sequelize.JSON,
      allowNull: false
    });

    await queryInterface.changeColumn('Users', 'title', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('Users', 'experience', {
      type: Sequelize.TEXT,
      allowNull: false
    });

    await queryInterface.changeColumn('Users', 'education', {
      type: Sequelize.TEXT,
      allowNull: false
    });

    await queryInterface.changeColumn('Users', 'personalwebsite', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('Users', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: false
    });

    await queryInterface.changeColumn('Users', 'username', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
