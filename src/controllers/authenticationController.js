const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require("../models/user");
const Outlet = require("../models/outlet");

exports.login = async (req, res) => {
  const {username, password} = req.body
  try {
    if(username && password) {
        const user = await User.getByUsername(username);

        if(!user) {
            return res.status(401).json({
                message: "Username tidak terdaftar!"
            })
        }

        const match = await bcrypt.compare(password, user.password);

        if(match) {
            let outletName = "GASPOL";
            if(!user.role === 1) {
                const outlet = await Outlet.getByOutletId(user.outlet_id);
                outletName = outlet.name;
            } 

            const token = jwt.sign(
                {
                    userId: user.id,
                    username: user.username,
                    role: user.role,
                    outlet_id: user.outlet_id,
                    outlet_name: outletName,
                    menu_access: user.menu_access,
                },
                process.env.JWT_SECRET_KEY,
                { expiresIn: '1d'}
            )

            return res.status(200).json(
                {
                    message: "Login Sukses!",
                    token: token,
                }
            )
        } else {
            return res.status(401).json({
                message: "Password Salah!"
            })
        }
    } else {
        return res.status(400).json({
            message: "Username atau Password harus diisi!"
        })
    }
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Login Failed!",
    });
  }
};