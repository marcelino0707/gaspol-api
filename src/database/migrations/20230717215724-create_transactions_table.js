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
      receipt_number: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      customer_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      customer_seat: {
        allowNull: true,
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      customer_cash: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0, 
      },
      customer_change: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0, 
      },
      total: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0, 
      },
      payment_type: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null, 
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
      refund_reason: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null, 
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
