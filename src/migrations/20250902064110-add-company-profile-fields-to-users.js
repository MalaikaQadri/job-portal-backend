'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'bannerImage', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'companyName', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "Not Provided"
    });
    await queryInterface.addColumn('Users', 'aboutUs', {
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: "N/A"
    });
    await queryInterface.addColumn('Users', 'organizationType', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "Not Provided"
    });
    await queryInterface.addColumn('Users', 'teamSize', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "1-10"
    });
    await queryInterface.addColumn('Users', 'industryTypes', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "General"
    });
    await queryInterface.addColumn('Users', 'yearOfEstablishment', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('Users', 'companyWebsite', {
      type: Sequelize.STRING,
      allowNull: true,
      validate: { isUrl: true }
    });
    await queryInterface.addColumn('Users', 'facebookLink', {
      type: Sequelize.STRING,
      allowNull: true,
      validate: { isUrl: true }
    });
    await queryInterface.addColumn('Users', 'instagramLink', {
      type: Sequelize.STRING,
      allowNull: true,
      validate: { isUrl: true }
    });
    await queryInterface.addColumn('Users', 'linkedInLink', {
      type: Sequelize.STRING,
      allowNull: true,
      validate: { isUrl: true }
    });
    await queryInterface.addColumn('Users', 'twitterLink', {
      type: Sequelize.STRING,
      allowNull: true,
      validate: { isUrl: true }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'bannerImage');
    await queryInterface.removeColumn('Users', 'companyName');
    await queryInterface.removeColumn('Users', 'aboutUs');
    await queryInterface.removeColumn('Users', 'organizationType');
    await queryInterface.removeColumn('Users', 'teamSize');
    await queryInterface.removeColumn('Users', 'industryTypes');
    await queryInterface.removeColumn('Users', 'yearOfEstablishment');
    await queryInterface.removeColumn('Users', 'companyWebsite');
    await queryInterface.removeColumn('Users', 'facebookLink');
    await queryInterface.removeColumn('Users', 'instagramLink');
    await queryInterface.removeColumn('Users', 'linkedInLink');
    await queryInterface.removeColumn('Users', 'twitterLink');
  }
};
