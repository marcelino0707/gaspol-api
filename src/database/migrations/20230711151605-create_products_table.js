'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_outlets: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      timestamp: {
        allowNull: false,
        type: Sequelize.STRING,
      },
    }
  },

  async down (queryInterface, Sequelize) {
    
  }
};
