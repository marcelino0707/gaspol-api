'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('menu_details', 
    [
      {
        menu_id: 1,
        varian: "Kecombrang",
        price: 20000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 1,
        varian: "Teri Medan",
        price: 22000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 2,
        varian: "Pedas Banget",
        price: 25000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 2,
        varian: "Sambal Bawang",
        price: 3000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 3,
        varian: "Coca Cola",
        price: 8000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 3,
        varian: "Original",
        price: 10000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 4,
        varian: "Lemon",
        price: 3000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 4,
        varian: "Original",
        price: 5000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 5,
        varian: "Vanila",
        price: 10000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 5,
        price: 12000,
        varian: "Original",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 6,
        varian: "Manja Banget",
        price: 10000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 6,
        price: 12000,
        varian: "Original",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 7,
        varian: "Original",
        price: 3000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 8,
        varian: "Original",
        price: 3500,
        created_at: new Date(),
        updated_at: new Date()
      },
    ],{});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('menu_details', null, {});
  }
};
