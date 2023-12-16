'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('ingredients', {
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
      ingredient_type_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      ingredient_unit_type_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      storage_location_warehouse_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      supplier_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      ingredient_access: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      is_kitchen: {
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
    await queryInterface.dropTable('ingredients');
  }
};
