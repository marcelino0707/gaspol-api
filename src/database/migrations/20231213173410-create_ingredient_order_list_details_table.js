'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ingredient_order_list_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      ingredient_order_list_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      ingredient_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      leftover: {
        allowNull: true,
        type: Sequelize.DECIMAL(10, 1),
      },
      order_request_quantity: {
        allowNull: true,
        type: Sequelize.DECIMAL(10, 1),
      },
      real: {
        allowNull: true,
        type: Sequelize.DECIMAL(10, 1),
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
    await queryInterface.dropTable('ingredient_order_list_details');
  }
};
