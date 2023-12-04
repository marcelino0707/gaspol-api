'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('cart_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      cart_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      menu_id :{
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      menu_detail_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      serving_type_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      discount_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      price: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.FLOAT,
      },
      discounted_price: {
        allowNull: true,
        defaultValue: 0,
        type: Sequelize.FLOAT,
      },
      total_price: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.FLOAT,
      },
      qty: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0, 
      },
      note_item: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null, 
      },
      cancel_reason: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null, 
      },
      is_canceled: {
        allowNull: true,
        defaultValue: 0,
        type: Sequelize.TINYINT,
      },
      is_ordered: {
        allowNull: true,
        defaultValue: 0,
        type: Sequelize.TINYINT,
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
    await queryInterface.dropTable('cart_details');
  }
};
