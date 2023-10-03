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
    ],{});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('outlets', null, {});
  }
};
