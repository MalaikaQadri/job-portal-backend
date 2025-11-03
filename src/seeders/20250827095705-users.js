'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

        const hashedPassword1 = await bcrypt.hash('123456$', 10);

        await queryInterface.bulkInsert('Users', [
          {
            fullName: 'Admin',
            username: 'Admin',
            email: 'admin1@example.com',
            password: hashedPassword1,
            role: "admin",
            isEmailVerified: true,
            is2FAEnabled: false,
            createdAt: new Date(),
            updatedAt: new Date()
  },

   ], {});
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.bulkDelete('Users', null, {});
  }
};





