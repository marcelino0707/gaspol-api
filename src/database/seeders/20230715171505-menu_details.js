'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('menu_details', 
    [
      {
        menu_id: 1,
        serving_type_id: 1,
        price: 20000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 1,
        serving_type_id: 2,
        price: 22000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 2,
        serving_type_id: 1,
        price: 25000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 2,
        serving_type_id: 2,
        price: 27000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 3,
        serving_type_id: 1,
        price: 8000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 3,
        serving_type_id: 2,
        price: 10000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 4,
        serving_type_id: 1,
        price: 3000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 4,
        serving_type_id: 2,
        price: 5000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 5,
        serving_type_id: 1,
        price: 10000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 5,
        serving_type_id: 2,
        price: 12000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 6,
        serving_type_id: 1,
        price: 10000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 6,
        serving_type_id: 2,
        price: 12000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 7,
        serving_type_id: 1,
        price: 3000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 7,
        serving_type_id: 2,
        price: 3500,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 8,
        serving_type_id: 1,
        price: 3000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        menu_id: 8,
        serving_type_id: 2,
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
