'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('update_confirms', {
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
      outlet_name: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      version: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      new_version: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      last_updated: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('transactions');
  }
};
