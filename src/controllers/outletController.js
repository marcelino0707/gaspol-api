const Outlet = require('../models/outlet');

exports.getOutlets = async (req, res) => {
    try {
        const outlets = await Outlet.getAll();

        return res.status(200).json({
            data: outlets
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || 'Failed to fetch outlets',
        })
    }
}