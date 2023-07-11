require('dotenv').config();

const mysql = require('mysql2');

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

const mysql2Connection = mysql.createPool(dbConfig);

module.exports = {
    // config for sequelize (migration and seeder)
    development: {
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
    },
    // config for mysql2
    mysql2Connection,
};