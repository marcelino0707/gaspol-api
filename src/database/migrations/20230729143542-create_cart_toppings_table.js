'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('cart_toppings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      cart_detail_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      menu_detail_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      serving_type_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      price: {
        allowNull: false,
        defaultValue: 0,
        type: Sequelize.FLOAT,
      },
      qty: {  
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0, 
      },
      is_topping: {
        allowNull: true,
        defaultValue: true,
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
      }
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('cart_toppings');
  }
};
