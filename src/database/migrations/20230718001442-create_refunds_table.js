"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("refunds", {
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
      is_refund_type_all: {
        allowNull: true,
        defaultValue: 0,
        type: Sequelize.TINYINT,
      },
      payment_type_id_all: {
        allowNull: true,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      refund_reason: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      total_refund: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("refunds");
  },
};
