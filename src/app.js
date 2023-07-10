require('dotenv').config();

const express = require('express')
const bodyParser = require('body-parser');
const app = express()
const port = process.env.PORT;

// Parse requests
app.use(bodyParser.json())

// Routes
app.use(require('./routes'))

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});