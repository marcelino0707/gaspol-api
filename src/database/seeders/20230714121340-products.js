'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('products', 
    [
      {
        id_outlet: 1,
        name: "Bubuk Teh Tarik",
        stock: 10,
        cost: 50000,
        unit: "kg",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_outlet: 1,
        name: "Bubuk Pop Ice",
        stock: 20,
        cost: 100000,
        unit: "kg",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id_outlet: 1,
        name: "Creamer Premium",
        stock: 30,
        cost: 300000,
        unit: "pcs",
        created_at: new Date(),
        updated_at: new Date()
      },
    ],{});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('products', null, {});
  }
};
