'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('menus', 
    [
      {
        name: "Nasi Goreng Ceria",
        menu_type: "Makanan",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Pecel Ayam Bahagia",
        menu_type: "Makanan",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Es Susu Soda Gembira",
        menu_type: "Minuman",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Es Teh Manis",
        menu_type: "Minuman",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Puding Ding Coklat",
        menu_type: "Dessert",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Ice Cream Manja",
        menu_type: "Dessert",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Sambal Bawang",
        menu_type: "Sambal",
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: "Sambal Matahmu",
        menu_type: "Sambal",
        created_at: new Date(),
        updated_at: new Date()
      },
    ],{});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('menus', null, {});
  }
};
