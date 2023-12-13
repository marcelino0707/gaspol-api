'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "ingredient_storage_outlet_locations",
      [
        {
          name: "GABUNG",
          is_active: 1,
        },
        {
          name: "KITCHEN",
          is_active: 1,
        },
        {
          name: "BAR",
          is_active: 1,
        },
      ],
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("ingredient_storage_outlet_locations", null, {});
  }
};
