// Model Sequelize
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('sqlite::memory:');

const Outlet = sequelize.define('outlet', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    user_unix_code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
});

Outlet.associate = (models) => {
    Outlet.hasMany(models.User, { foreignKey: 'outlet_id' });
};

module.exports = Outlet;
