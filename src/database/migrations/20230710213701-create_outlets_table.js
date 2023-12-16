'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('outlets', {
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
      address: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      phone_number :{
        allowNull: true,
        type: Sequelize.STRING,
      },
      pin: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      footer: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      is_kitchen_bar_merged: {
        allowNull: true,
        defaultValue: 1,
        type: Sequelize.TINYINT,
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
    await queryInterface.dropTable('outlets');
  }
};
