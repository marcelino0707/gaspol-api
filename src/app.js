const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
//const path = require("path");

const app = express();
dotenv.config();

// Parse requests
app.use(bodyParser.json());

// Enable CORS
app.use(cors());

// Serving static files from the "public" directory
app.use("/public", express.static("public"));

// Routes
app.use(require("./routes"));

// Start server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
