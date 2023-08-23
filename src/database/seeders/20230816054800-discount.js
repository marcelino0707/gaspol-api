'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('discounts', 
    [
      {
        code: 'DISC10',
        is_percent: true,
        is_discount_cart: true,
        value: 10,
        start_date: '2023-07-01',
        end_date: '2023-07-31',
        min_purchase: 60000,
        max_discount: 30000,
      },
      {
        code: 'MerdekaNasgor',
        is_percent: false,
        is_discount_cart: false,
        value: 10000,
        start_date: '2023-07-01',
        end_date: '2023-07-31',
        min_purchase: 20000,
      },
      {
        code: 'Murah Meriah',
        is_percent: false,
        is_discount_cart: false,
        value: 12000,
        start_date: '2023-07-01',
        end_date: '2023-07-31',
        min_purchase: 25000,
      },
    ],{});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('discounts', null, {});
  }
};
