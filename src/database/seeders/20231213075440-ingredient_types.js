'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "ingredient_types",
      [
        {
          name: "BEANS",
          is_active: 1,
        },
        {
          name: "POWDER",
          is_active: 1,
        },
        {
          name: "SYRUP, JUICE & SAUCE",
          is_active: 1,
        },
        {
          name: "MILK, TEA & SUGAR",
          is_active: 1,
        },
        {
          name: "CASHIER & CONDIMENTS",
          is_active: 1,
        },
        {
          name: "PACKAGING",
          is_active: 1,
        },
        {
          name: "HOUSEKEEPING",
          is_active: 1,
        },
        {
          name: "FRUITS",
          is_active: 1,
        },
        {
          name: "STOCK TERHITUNG",
          is_active: 1,
        },
        {
          name: "VEGETABLE",
          is_active: 1,
        },
        {
          name: "GROCERIES",
          is_active: 1,
        },
        {
          name: "ANEKA LAUK/FROZEN",
          is_active: 1,
        },
        {
          name: "ANEKA",
          is_active: 1,
        },
      ],
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("ingredient_types", null, {});
  }
};
