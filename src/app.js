const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
//const path = require("path");

const app = express();
dotenv.config();

// Parse requests with increased limit
app.use(bodyParser.json({ limit: '20mb' })); // Set to 10mb or any size you need
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true })); // Set to 10mb or any size you need

// Enable CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN,
}));

// Serving static files from the "public" directory
app.use("/public", express.static("public"));

// Routes
app.use(require("./routes"));

// Start server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
