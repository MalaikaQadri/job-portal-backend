'use strict';

// const { sequelize } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.sequelize.query(`
        ALTER TABLE "Users"
        ALTER COLUMN "tokenExpiresAt" TYPE 
        TIMESTAMP WITH TIME ZONE 
        USING "tokenExpiresAt"::timestamp with time zone;`
    );
   
      await queryInterface.changeColumn ('Users', 'tokenExpiresAt', { 
        type: Sequelize.DATE
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Users"
      ALTER COLUMN "tokenExpiresAt" TYPE TEXT
      USING "tokenExpiresAt"::text;
      `);

         await queryInterface.changeColumn('Users', 'tokenExpiresAt',{
          type: Sequelize.STRING, // Revert to the original data type
          allowNull: true,
         });
  }
};
