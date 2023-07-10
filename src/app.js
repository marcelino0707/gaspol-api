const express = require('express')
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
// const { sequelize } = require('./models');

const app = express()
dotenv.config();

// Parse requests
app.use(bodyParser.json())

// Routes
app.use(require('./routes'))

// Sync database and start server
const port = process.env.PORT;
// sequelize
    // .sync()
    // .then(() => {
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    // })
    // .catch((error) => {
        // console.log('Unable to connect to the database:', error);
    // });
