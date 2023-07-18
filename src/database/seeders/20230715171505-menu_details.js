'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('menu_details', 
    [
      {
        menu_id: 1,
        serving_type: "Dine In",
        varian: "Kecombrang",
        price: 20000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 1,
        serving_type: "Take Away",
        varian: "Kecombrang",
        price: 22000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 2,
        serving_type: "Dine In",
        varian: "Pedas Banget",
        price: 25000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 2,
        serving_type: "Take Away",
        varian: "Pedas Banget",
        price: 27000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 3,
        serving_type: "Dine In",
        price: 8000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 3,
        serving_type: "Take Away",
        price: 10000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 4,
        serving_type: "Dine In",
        price: 3000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 4,
        serving_type: "Take Away",
        price: 5000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 5,
        serving_type: "Dine In",
        price: 10000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 5,
        serving_type: "Take Away",
        price: 12000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 6,
        serving_type: "Dine In",
        price: 10000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 6,
        serving_type: "Take Away",
        price: 12000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 7,
        serving_type: "Dine In",
        price: 3000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 7,
        serving_type: "Take Away",
        price: 3500,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 8,
        serving_type: "Dine In",
        price: 3000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 8,
        serving_type: "Take Away",
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
