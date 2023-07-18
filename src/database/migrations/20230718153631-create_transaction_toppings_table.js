'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('transaction_toppings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      transaction_detail_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      menu_detail_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      total_item: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0, 
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
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('transaction_toppings');
  }
};
