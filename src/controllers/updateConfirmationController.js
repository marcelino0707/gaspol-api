const UpdateConfirm = require("../models/update_confirm");
const logger = require('../utils/logger');

exports.getUpdateConfirms = async (req, res) => {
    try {
        const result = await UpdateConfirm.getAll();

        return res.status(200).json({
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Failed to fetch update confirm",
        });
    }
};

exports.create = async (req, res) => {
    try {
        const { outlet_id } = req.query;

        const {
            outlet_name, version, new_version, last_updated
        } = req.body;

        const updateConfirm = {
            outlet_id: outlet_id,
            outlet_name: outlet_name,
            version: version,
            new_version: new_version,
            last_updated: last_updated,
        };

        const existUpdateConfirm = await UpdateConfirm.getByOutletId(outlet_id);

        if(existUpdateConfirm != null) {
            await UpdateConfirm.update(outlet_id, updateConfirm);
        } else {
            await UpdateConfirm.create(updateConfirm);
        }

        return res.status(201).json({
            member: "Data update confirm created successfully",
        });
    } catch (error) {
        logger.error(`Error in updateConfirmation: ${error.stack}`);
        return res.status(500).json({
            message: error.message || "Some error occurred while creating update confirm",
        });
    }
};