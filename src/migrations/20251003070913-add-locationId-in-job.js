"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Jobs", "locationId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Locations",
        key: "id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.removeColumn("Jobs", "location");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Jobs", "location", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.removeColumn("Jobs", "locationId");
  },
};
