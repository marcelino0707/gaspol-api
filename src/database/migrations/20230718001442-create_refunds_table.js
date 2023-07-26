'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('refunds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      transaction_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      is_refund_all: {
        allowNull: true,
        defaultValue: 0,
        type: Sequelize.TINYINT,
      },
      refund_reason: {
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
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('refunds');
  }
};
