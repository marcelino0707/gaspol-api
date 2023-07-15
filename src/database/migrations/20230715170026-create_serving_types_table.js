'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('serving_types', {
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
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('serving_types');
  }
};
