'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('outlets', 
    [
      {
        name: "Jempolan Coffee & Eatery",
        address: "Tiyosan, Condongcatur, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281",
        pin: 13456,
        phone_number: "085869555446",
        footer: "Password Wiffi : akucintajempolan",
        is_kitchen_bar_merged: 0,
      },
      {
        name: "Sambel Colek Condong Catur",
        address: "Jl. Candi Gebang No.199 CC, Dero, Condongcatur, Depok, Sleman Regency, Special Region of Yogyakarta 55281",
        pin: 12346,
        is_kitchen_bar_merged: 1,
      },
      {
        name: "Sambel Nyah Ti",
        address: "Jl. glagahsari",
        pin: 12345,
        is_kitchen_bar_merged: 1
      },
    ],{});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('outlets', null, {});
  }
};
