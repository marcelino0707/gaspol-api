'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('menus', 
    [
      {
        name: "Nasi Goreng Ceria",
        menu_type: "Makanan",
        price: 20000,
        outlet_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Pecel Ayam Bahagia",
        menu_type: "Makanan",
        price: 22000,
        outlet_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Es Susu Soda Gembira",
        menu_type: "Minuman",
        price: 15000,
        outlet_id: 1,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Es Teh Manis",
        price: 5000,
        outlet_id: 1,
        menu_type: "Minuman",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Puding Ding Coklat",
        price: 7000,
        outlet_id: 1,
        menu_type: "Additional Makanan",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Ice Cream Manja",
        price: 8000,
        outlet_id: 1,
        menu_type: "Additional Makanan",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Sambal Bawang",
        price: 2000,
        outlet_id: 1,
        menu_type: "Additions",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Sambal Matahmu",
        price: 4000,
        outlet_id: 1,
        menu_type: "Additional Makanan",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Sosis Sapi Goreng",
        price: 2000,
        outlet_id: 1,
        menu_type: "Additional Makanan",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Nugget",
        price: 4000,
        outlet_id: 1,
        menu_type: "Additional Makanan",
        created_at: new Date(),
        updated_at: new Date()
      },
    ],{});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('menus', null, {});
  }
};
