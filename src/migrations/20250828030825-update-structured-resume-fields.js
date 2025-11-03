'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Change datatype of experience
    await queryInterface.changeColumn('StructuredResumes', 'experience', {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    // Change datatype of projects
    await queryInterface.changeColumn('StructuredResumes', 'projects', {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    // Add unique constraint to userId
    await queryInterface.changeColumn('StructuredResumes', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'Users',
        key: 'id',
      },
      onDelete: 'CASCADE', // optional
    });

    // Add URL validation (only works at model-level, not DB).
    // For DB, you can only enforce STRING length or regex check
    await queryInterface.changeColumn('StructuredResumes', 'personalwebsite', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert experience to STRING
    await queryInterface.changeColumn('StructuredResumes', 'experience', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Revert projects to STRING
    await queryInterface.changeColumn('StructuredResumes', 'projects', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Remove unique from userId
    await queryInterface.changeColumn('StructuredResumes', 'userId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    });

    // Revert personalWebsite
    await queryInterface.changeColumn('StructuredResumes', 'personalwebsite', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
