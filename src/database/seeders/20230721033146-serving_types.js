'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('serving_types', 
    [
      {
        name: "Dine In",
        percent: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Take Away",
        percent: 3,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Delivery Service",
        percent: 10,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "GoFood",
        percent: 20,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "GrabFood",
        percent: 30,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "ShopeeFood",
        percent: 20,
        created_at: new Date(),
        updated_at: new Date()
      },
    ],{});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('serving_types', null, {});
  }
};
