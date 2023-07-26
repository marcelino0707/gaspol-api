'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('menu_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      menu_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      varian: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      is_topping: {
        allowNull: true,
        defaultValue: 0,
        type: Sequelize.TINYINT,
      },
      price: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.FLOAT,
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
    await queryInterface.dropTable('menu_details');
  }
};
