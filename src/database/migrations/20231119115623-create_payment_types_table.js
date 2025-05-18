'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('payment_types', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      payment_category_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      outlet_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      is_active: {
        allowNull: true,
        defaultValue: 1,
        type: Sequelize.TINYINT,
      },
      order: {
        allowNull: true,
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable('payment_types');
  }
};
