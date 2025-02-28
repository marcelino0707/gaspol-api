'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      outlet_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      cart_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      transaction_ref:{
        allowNull: true,
        type: Sequelize.STRING,
      },
      member_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      receipt_number: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      customer_name: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      customer_seat: {
        allowNull: true,
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      customer_cash: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.FLOAT, 
      },
      customer_change: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.FLOAT, 
      },
      payment_type_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      delivery_type: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null, 
      },
      delivery_note: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null, 
      },
      invoice_number: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null, 
      },
      invoice_due_date: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null, 
      },
      discount_name: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      member_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      member_phone_number :{
        allowNull: false,
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('transactions');
  }
};
