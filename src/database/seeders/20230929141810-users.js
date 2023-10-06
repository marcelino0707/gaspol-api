'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up (queryInterface, Sequelize) {
    const saltRounds = 10;
    const hashedSuperAdminPassword = await bcrypt.hash("Simple123!", saltRounds);
    const hashedAdminPassword = await bcrypt.hash("Password123!", saltRounds);

    await queryInterface.bulkInsert('users', 
    [
      {
        name: "Super Admin",
        username: 'superadmin',
        password: hashedSuperAdminPassword,
        role: 1,
        outlet_id: 0,
        menu_access: "1",
      },
      {
        name: "Admin Jempolan",
        username: 'adminjempolan',
        password: hashedAdminPassword,
        role: 2,
        outlet_id: 1,
        menu_access: "2,3",
      },
      {
        name: "Admin Sambal Colek",
        username: 'admincolek',
        password: hashedAdminPassword,
        role: 2,
        outlet_id: 2,
        menu_access: "2",
      },
    ],{});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
