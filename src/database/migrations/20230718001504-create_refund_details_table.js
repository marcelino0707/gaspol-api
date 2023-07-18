'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('refund_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      refund_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      refund_reason_item: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      total_refund_item: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
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
    await queryInterface.dropTable('refund_details');
  }
};
