'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "ingredient_unit_types",
      [
        {
          name: "PCS",
          is_active: 1,
        },
        {
          name: "PACK",
          is_active: 1,
        },
        {
          name: "KG",
          is_active: 1,
        },
      ],
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("ingredient_unit_types", null, {});
  }
};
