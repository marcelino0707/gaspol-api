const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const upload = multer();

const app = express();
dotenv.config();

// for parsing application/json
app.use(bodyParser.json());

// for parsing application/xwww-form-urlencoded
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// for parsing multipart/form-data
app.use(upload.array());

// Cors
app.use(cors());

// Routes
app.use(require("./routes"));

// Start server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
