const Outlet = require('../models/outlet');

exports.checkPin = async (req, res) => {
    const { outlet_id, pin } = req.body;
    try {
        const outlet = await Outlet.getByOutletId(outlet_id);
        if(outlet.pin != pin) {
            return res.status(401).json({
                code: 401,
                message: "Pin Salah!"
            })
        }
        else{
            return res.status(200).json({
                code: 200,
                message: "Pin Benar!",
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to check pin!',
        })
    }
}