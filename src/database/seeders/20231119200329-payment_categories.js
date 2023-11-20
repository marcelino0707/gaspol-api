"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "payment_categories",
      [
        {
          id: 1,
          name: "Cash Payment",
          outlet_id: 1,
        },
        {
          id: 2,
          name: "Online Delivery Payment",
          outlet_id: 1,
        },
        {
          id: 3,
          name: "EDC Payment",
          outlet_id: 1,
        },
        {
          id: 4,
          name: "Other Payment",
          outlet_id: 1,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("payment_categories", null, {});
  },
};
