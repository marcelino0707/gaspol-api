'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('shift_reports', {
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
      actual_ending_cash: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      cash_difference: {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },
      start_date: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null, 
      },
      end_date: {
        allowNull: true,
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('shift_reports');
  }
};
