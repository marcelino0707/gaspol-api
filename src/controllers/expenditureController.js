const Expenditure = require("../models/expenditure");
const moment = require("moment-timezone");

exports.createExpense = async (req, res) => {
  try {
    const { description, nominal, outlet_id } = req.body;

    const expense = {
      description: description,
      nominal: nominal,
      outlet_id: outlet_id,
    };

    await Expenditure.create(expense);

    return res.status(201).json({
      code: 201,
      message: "Expenditure created successfully!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to create expenditure",
    });
  }
};

exports.createSyncExpense = async (req, res) => {
  try {
    const { description, nominal, outlet_id, created_at } = req.body;

    // Validate the input data
    if (!description || !nominal || !outlet_id || !created_at) {
      return res.status(400).json({
        code: 400,
        message: "Invalid input. Please provide description, nominal, outlet_id, and created_at."
      });
    }
    const thisTimeNow = moment();
    const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();

    // Create the expense object
    const expense = {
      description,
      nominal,
      outlet_id,
      created_at: moment.tz(created_at, "Asia/Jakarta").toDate(),
      updated_at: indoDateTime
    };

    // Save the expense to the database
    await Expenditure.create(expense);

    return res.status(201).json({
      code: 201,
      message: "Expenditure created successfully!",
    });
  } catch (error) {
    console.error(`Error creating expenditure: ${error.message}`);
    return res.status(500).json({
      code: 500,
      message: error.message || "Failed to create expenditure",
    });
  }
};