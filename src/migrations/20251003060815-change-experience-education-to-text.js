"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.sequelize.query(`
      ALTER TABLE "Jobs"
      ALTER COLUMN "experience" TYPE TEXT USING "experience"::TEXT;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE "Jobs"
      ALTER COLUMN "education" TYPE TEXT USING "education"::TEXT;
    `);
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.sequelize.query(`
      ALTER TABLE "Jobs"
      ALTER COLUMN "experience" TYPE INTEGER USING "experience"::INTEGER;
    `);
    await queryInterface.sequelize.query(`
      ALTER TABLE "Jobs"
      ALTER COLUMN "education" TYPE INTEGER USING "education"::INTEGER;
    `);
  },
};
