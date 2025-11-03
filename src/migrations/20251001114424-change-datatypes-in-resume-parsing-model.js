'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.sequelize.query(`
      ALTER TABLE "AIResumeParsings" 
      ALTER COLUMN "skills" TYPE TEXT[]
      USING string_to_array("skills", ',');
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "AIResumeParsings" 
      ALTER COLUMN "education" TYPE JSON 
      USING to_json("education"::text);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "AIResumeParsings" 
      ALTER COLUMN "experience" TYPE JSON 
      USING to_json("experience"::text);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "AIResumeParsings" 
      ALTER COLUMN "projects" TYPE JSON 
      USING to_json("projects"::text);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE "AIResumeParsings" 
      ALTER COLUMN "certifications" TYPE JSON 
      USING to_json("certifications"::text);
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('AIResumeParsings', 'skills', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('AIResumeParsings', 'education', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('AIResumeParsings', 'experience', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('AIResumeParsings', 'projects', {
      type: Sequelize.STRING,
    });
    await queryInterface.changeColumn('AIResumeParsings', 'certifications', {
      type: Sequelize.STRING,
    });
  }
};