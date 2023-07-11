const express = require('express')
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

const app = express()
dotenv.config();

// Parse requests
app.use(bodyParser.json())

// Routes
app.use(require('./routes'))

// Start server
const port = process.env.PORT;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
