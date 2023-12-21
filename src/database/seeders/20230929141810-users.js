'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', 
    [
      {
        name: "Super Admin",
        username: 'superadmin',
        password: "Simple123!",
        role: 1,
        outlet_id: 0,
        menu_access: "1",
      },
      {
        name: "Admin Jempolan",
        username: 'adminjempolan',
        password: "Password123!",
        role: 2,
        outlet_id: 1,
        menu_access: "2,3,4",
      },
      {
        name: "Admin Sambal Colek",
        username: 'admincolek',
        password: "12345678",
        role: 2,
        outlet_id: 2,
        menu_access: "2",
      },
      {
        name: "Gaspol Pengadaan",
        username: 'warehouse',
        password: "Gaspol123!",
        role: 3,
        outlet_id: 0,
        menu_access: "0",
      },
    ],{});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};
