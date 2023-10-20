'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('custom_prices', 
    [
      {
        name: "Dine In",
      },
      {
        name: "Take Away",
      },
      {
        name: "Delivery Service",
      },
      {
        name: "GoFood",
      },
      {
        name: "GrabFood",
      },
      {
        name: "ShopeeFood",
      },
    ],{});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('outlets', null, {});
  }
};
