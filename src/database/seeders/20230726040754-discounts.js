'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('discounts', 
    [
      {
        code: 'DISC10',
        type: 'Percentage',
        value: 10,
        start_date: '2023-07-01',
        end_date: '2023-07-31',
        min_purchase: 4,
        max_discount: 30000,
      },
      {
        code: 'FREESHIP',
        type: 'Fixed Amount',
        value: 5000,
        start_date: '2023-09-01',
        end_date: '2023-09-30',
        min_purchase: 2,
        max_discount: 25000,
      },
      {
        code: 'DISC20',
        type: 'Percentage',
        value: 20,
        start_date: '2023-08-01',
        end_date: '2023-08-31',
        min_purchase: 1,
        max_discount: 30000,
      },
    ],{});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('discounts', null, {});
  }
};
