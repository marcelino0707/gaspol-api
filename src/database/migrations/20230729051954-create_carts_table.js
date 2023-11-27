'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('carts', {
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
      subtotal: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.FLOAT,
      },
      total: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.FLOAT,
      },
      discount_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      is_active: {
        allowNull: true,
        defaultValue: 1,
        type: Sequelize.TINYINT,
      },
      is_canceled: {
        allowNull: true,
        defaultValue: 0,
        type: Sequelize.TINYINT,
      },
      is_queuing: {
        allowNull: true,
        defaultValue: 0,
        type: Sequelize.TINYINT,
      },
      cancel_reason: {
        allowNull: true,
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
    await queryInterface.dropTable('carts');
  }
};
