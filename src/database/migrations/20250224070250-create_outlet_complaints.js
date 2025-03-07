'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('outlet_complaints', {
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
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      message: {
        allowNull: false,
        type: Sequelize.MEDIUMTEXT,
      },
      sent_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      log_last_outlet: {
        allowNull: false,
        type: Sequelize.MEDIUMTEXT,
      },
      cache_transaction: {
        allowNull: false,
        type: Sequelize.MEDIUMTEXT,
      },
      cache_failed_transaction: {
        allowNull: false,
        type: Sequelize.MEDIUMTEXT,
      },
      cache_success_transaction: {
        allowNull: false,
        type: Sequelize.MEDIUMTEXT,
      },
      cache_history_transaction: {
        allowNull: false,
        type: Sequelize.MEDIUMTEXT,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('outlet_complaints');
  }
};