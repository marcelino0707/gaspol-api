const Outlet = require("../models/outlet");
const User = require("../models/user");

exports.getUsers = async (req, res) => {
  try {
    const users = await User.getUsers();

    const modifiedUsers = users.map((user) => {
      let roleName = "Admin";
      if (user.role == 1) {
        user.outlet_name = "Gaspol";
        roleName = "Super Admin";
      }
      return {
        ...user,
        role_name: roleName,
      };
    });

    return res.status(200).json({
      data: modifiedUsers,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Get Users Failed!",
    });
  }
};

exports.getUserById = async (req, res) => {
    const { id } = req.params;
  try {
    const user = await User.getByUserId(id);

    let roleName = "Admin";
    if (user.role == 1) {
        user.outlet_name = "Gaspol";
        roleName = "Super Admin";
    }

    const outlets = await Outlet.getAll();

    const result = {
        ...user,
        role_name: roleName,
        outlets: outlets,
    }
    return res.status(200).json({
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Get Users Failed!",
    });
  }
};
