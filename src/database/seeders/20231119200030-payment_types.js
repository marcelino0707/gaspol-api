"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "payment_types",
      [
        {
          id: 1,
          name: "Tunai",
          payment_category_id: 1,
          is_active: 1,
          outlet_id: 1,
        },
        {
          id: 2,
          name: "EDC Debit BCA",
          payment_category_id: 3,
          is_active: 1,
          outlet_id: 1,
        },
        {
          id: 3,
          name: "Transfer Mandiri",
          payment_category_id: 4,
          is_active: 1,
          outlet_id: 1,
        },
        {
          id: 4,
          name: "GoFood",
          payment_category_id: 2,
          is_active: 1,
          outlet_id: 1,
        },
        {
          id: 5,
          name: "GrabFood",
          payment_category_id: 2,
          is_active: 1,
          outlet_id: 1,
        },
        {
          id: 6,
          name: "ShopeeFood",
          payment_category_id: 2,
          is_active: 1,
          outlet_id: 1,
        },
        {
          id: 7,
          name: "QR Gopay",
          payment_category_id: 2,
          is_active: 1,
          outlet_id: 1,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("payment_types", null, {});
  },
};
