const Outlet = require("../models/outlet");
const User = require("../models/user");
const moment = require("moment-timezone");

exports.checkPin = async (req, res) => {
  const { outlet_id, pin } = req.body;
  try {
    const outlet = await Outlet.getByOutletId(outlet_id);
    if (outlet.pin != pin) {
      return res.status(401).json({
        code: 401,
        message: "Pin Salah!",
      });
    } else {
      return res.status(200).json({
        code: 200,
        message: "Pin Benar!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to check pin!",
    });
  }
};

exports.checkPin = async (req, res) => {
  const { outlet_id, pin } = req.body;
  try {
    const outlet = await Outlet.getByOutletId(outlet_id);
    if (outlet.pin != pin) {
      return res.status(401).json({
        code: 401,
        message: "Pin Salah!",
      });
    } else {
      return res.status(200).json({
        code: 200,
        message: "Pin Benar!",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to check pin!",
    });
  }
};

exports.getOutlets = async (req, res) => {
  try {
    const outlets = await Outlet.getAll();

    return res.status(200).json({
      data: outlets,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Get Outlets Failed!",
    });
  }
};

exports.getOutletById = async (req, res) => {
  const { id } = req.params;
  try {
    const outlet = await Outlet.getByOutletId(id);

    return res.status(200).json({
      data: outlet,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Get Outlet Failed!",
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, address, pin, phone_number, footer, is_kitchen_bar_merged } = req.body;

    const outlet = {
      name: name,
      address: address,
      pin: pin,
      phone_number: phone_number,
      footer: footer,
      is_kitchen_bar_merged: is_kitchen_bar_merged
    };

    await Outlet.create(outlet);

    return res.status(201).json({
      message: "Data outlet berhasil ditambahkan!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while creating new outlet",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const thisTimeNow = moment();
    const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
    const outletId = req.params.id;
    const { name, address, pin, phone_number, footer, is_kitchen_bar_merged } = req.body;

    const updateOutlet = {
      name: name,
      address: address,
      pin: pin,
      phone_number: phone_number,
      footer: footer,
      is_kitchen_bar_merged: is_kitchen_bar_merged,
      updated_at: indoDateTime,
    };

    await Outlet.update(outletId, updateOutlet);

    return res.status(200).json({
      message: "Berhasil mengubah data outlet!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error to update outlet",
    });
  }
};

exports.delete = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  try {
    const outletId = req.params.id;
    const existUser = await User.getByUserByOutletId(outletId);
    if (existUser) {
      return res.status(401).json({
        message: "Gagal menghapus data outlet, terdapat user yang menggunakan outlet ini!",
      });
    } else {
      const deletedAtNow = {
        deleted_at: indoDateTime,
      };
  
      await Outlet.update(outletId, deletedAtNow);
  
      return res.status(200).json({
        message: "Berhasil menghapus data outlet",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error while deleting outlet",
    });
  }
};
