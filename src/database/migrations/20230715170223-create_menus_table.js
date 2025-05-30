'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('menus', {
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
      menu_type: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      price: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.INTEGER,
      },
      image_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_active: {
        allowNull: true,
        defaultValue: 1,
        type: Sequelize.TINYINT,
      },
      outlet_id: {
        allowNull: false,
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
    await queryInterface.dropTable('menus');
  }
};
