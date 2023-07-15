'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('serving_types', 
    [
      {
        name: "Dine In",
      },
      {
        name: "Take Away",
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
    await queryInterface.bulkDelete('serving_types', null, {});
  }
};
