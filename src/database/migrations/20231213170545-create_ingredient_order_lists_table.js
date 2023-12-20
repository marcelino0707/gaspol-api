'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ingredient_order_lists', {
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
      storage_location_outlet: {
        allowNull: true,
        defaultValue: 1,
        type: Sequelize.TINYINT,
      },
      order_date: {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null, 
      },
      pembuat_order: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null, 
      },
      penanggung_jawab: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null, 
      },
      penerima: {
        allowNull: true,
        type: Sequelize.STRING,
        defaultValue: null, 
      },
      pengirim: {
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
    await queryInterface.dropTable('ingredient_order_lists');
  }
};
