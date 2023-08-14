'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('menus', 
    [
      {
        name: "Nasi Goreng Ceria",
        menu_type: "Makanan",
        price: 20000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Pecel Ayam Bahagia",
        menu_type: "Makanan",
        price: 22000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Es Susu Soda Gembira",
        menu_type: "Minuman",
        price: 15000,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Es Teh Manis",
        price: 5000,
        menu_type: "Minuman",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Puding Ding Coklat",
        price: 7000,
        menu_type: "Dessert",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Ice Cream Manja",
        price: 8000,
        menu_type: "Dessert",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Sambal Bawang",
        price: 2000,
        menu_type: "Additions",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Sambal Matahmu",
        price: 4000,
        menu_type: "Additions",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Sosis Sapi Goreng",
        price: 2000,
        menu_type: "Additions",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Nugget",
        price: 4000,
        menu_type: "Additions",
        created_at: new Date(),
        updated_at: new Date()
      },
    ],{});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('menus', null, {});
  }
};
