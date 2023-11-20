const Outlet = require("../models/outlet");
const User = require("../models/user");
const moment = require("moment-timezone");

exports.updateProfile = async (req, res) => {
  const thisTimeNow = moment();
  const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
  try {
    const userId = req.params.id;
    const { name, username, password, pin, outlet_id } = req.body;

    const updatedUser = {
      name: name,
      username: username,
      password: password,
      updated_at: indoDateTime,
    };

    await User.update(userId, updatedUser);

    if (pin && pin != "") {
      const updatedOutlet = {
        pin: pin,
        updated_at: indoDateTime,
      };

      await Outlet.update(outlet_id, updatedOutlet);
    }

    return res.status(200).json({
      message: "Berhasil mengubah data profile!",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Error to update profile",
    });
  }
};
