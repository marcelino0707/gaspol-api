'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('discounts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      code: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      is_percent: {
        allowNull: true,
        defaultValue: 0,
        type: Sequelize.TINYINT,
      },
      is_discount_cart: {
        allowNull: true,
        defaultValue: 0,
        type: Sequelize.TINYINT,
      },
      value: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      start_date: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      end_date: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      min_purchase: {
        allowNull: true,
        defaultValue: 0,
        type: Sequelize.FLOAT,
      },
      max_discount: {
        allowNull: true,
        defaultValue: 0,
        type: Sequelize.FLOAT,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }, 
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null, 
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('discounts');
  }
};
