'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "ingredient_storage_warehouse_locations",
      [
        {
          name: "Gudang Barang",
          is_active: 1,
        },
        {
          name: "Belanja Pasar",
          is_active: 1,
        },
        {
          name: "Aneka Sayur",
          is_active: 1,
        },
        {
          name: "AC",
          is_active: 1,
        },
        {
          name: "Non AC",
          is_active: 1,
        },
      ],
      {}
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete("ingredient_storage_warehouse_locations", null, {});
  }
};
