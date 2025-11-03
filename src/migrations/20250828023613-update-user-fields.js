'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'otpCode', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('Users', 'otpExpiresAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.changeColumn('Users', 'otpVerifiedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.changeColumn('Users', 'token', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('Users', 'tokenExpiresAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    
    // For twofaBackupcode → convert safely to JSONB
    await queryInterface.sequelize.query(`
      ALTER TABLE "Users"
      ALTER COLUMN "twofaBackupcode" TYPE JSONB
      USING to_jsonb("twofaBackupcode"::text);
    `);

    await queryInterface.changeColumn('Users', 'twofaBackupcode', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: [], //  safer for existing rows
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Users', 'otpCode', {
      type: Sequelize.STRING,
      allowNull: false, 
    });

    await queryInterface.changeColumn('Users', 'otpExpiresAt', {
      type: Sequelize.DATE,
      allowNull: false, // old definition
    });

    await queryInterface.changeColumn('Users', 'otpVerifiedAt', {
      type: Sequelize.DATE,
      allowNull: false, // old definition
    });

    await queryInterface.changeColumn('Users', 'token', {
      type: Sequelize.STRING,
      allowNull: false, // old definition
    });
    
     // Convert JSONB back to text (old version was STRING)
    await queryInterface.sequelize.query(`
      ALTER TABLE "Users"
      ALTER COLUMN "twofaBackupcode" TYPE TEXT
      USING "twofaBackupcode"::text;
    `);
    
    await queryInterface.changeColumn('Users', 'tokenExpiresAt', {
      type: Sequelize.DATE,
      allowNull: false, // old definition
    });

    await queryInterface.changeColumn('Users', 'twofaBackupcode', {
      type: Sequelize.STRING, // old definition you had earlier
      allowNull: false,
    });
  },
};
