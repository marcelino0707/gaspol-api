'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('transaction_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      transaction_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      menu_id :{
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      menu_detail_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      serving_type_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      total_item: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0, 
      },
      note_item: {
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
    await queryInterface.dropTable('transaction_details');
  }
};
