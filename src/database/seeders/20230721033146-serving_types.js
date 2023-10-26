'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('serving_types', 
    [
      {
        name: "Dine In",
        outlet_id: 1,
      },
      {
        name: "Take Away",
        outlet_id: 1,
      },
      {
        name: "Delivery Service",
        outlet_id: 1,
      },
      {
        name: "GoFood",
        outlet_id: 1,
      },
      {
        name: "GrabFood",
        outlet_id: 1,
      },
      {
        name: "ShopeeFood",
        outlet_id: 1,
      },
    ],{});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('serving_types', null, {});
  }
};
