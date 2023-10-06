'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('outlets', 
    [
      {
        name: "Jempolan Coffee & Eatery",
        address: "Tiyosan, Condongcatur, Kec. Depok, Kabupaten Sleman, Daerah Istimewa Yogyakarta 55281",
        pin: 13456,
      },
      {
        name: "Sambel Colek Condong Catur",
        address: "Jl. Candi Gebang No.199 CC, Dero, Condongcatur, Depok, Sleman Regency, Special Region of Yogyakarta 55281",
        pin: 123456,
      },
    ],{});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('outlets', null, {});
  }
};
