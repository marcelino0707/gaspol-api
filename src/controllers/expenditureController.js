const Expenditure = require("../models/expenditure");

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
