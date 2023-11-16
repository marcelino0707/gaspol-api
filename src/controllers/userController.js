const Outlet = require("../models/outlet");
const User = require("../models/user");
const moment = require("moment-timezone");
const thisTimeNow = moment();
const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();

exports.getUsers = async (req, res) => {
  try {
    const users = await User.getUsers();
    
    // untuk management user
    const outlets = await Outlet.getAll();

    const result = {
      users,
      outlets,
    };

    return res.status(200).json({
      data: result,
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

    return res.status(200).json({
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Get Users Failed!",
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, username, password, outlet_id, menu_access, role } = req.body;

    const user = {
      name: name,
      username: username,
      password: password,
      outlet_id: outlet_id,
      menu_access: menu_access,
      role: role,
    };

    await User.create(user);

    return res.status(201).json({
      message: "Data user berhasil ditambahkan!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while creating new user",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, username, outlet_id, menu_access } = req.body;

    const updatedUser = {
      name: name,
      username: username,
      outlet_id: outlet_id,
      menu_access: menu_access,
    };

    await User.update(userId, updatedUser);

    return res.status(200).json({
      message: "Berhasil mengubah data user!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error to update user",
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedAtNow = {
      deleted_at: indoDateTime,
    };

    await User.update(userId, deletedAtNow);

    return res.status(200).json({
      message: "Berhasil menghapus data user",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while deleting user",
    });
  }
};
