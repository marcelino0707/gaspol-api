const Complaint = require("../models/complaint");
const moment = require("moment-timezone");

exports.getComplaints = async (req, res) => {
    try {
        const result = await Complaint.getAll();

        return res.status(200).json({
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Failed to fetch complaints",
        });
    }
};

exports.create = async (req, res) => {
    try {
        const { outlet_id } = req.query;

        const {
            name,
            title,
            message,
            sent_at,
            log_last_outlet,
            cache_transaction,
            cache_failed_transaction,
            cache_success_transaction,
            cache_history_transaction,
        } = req.body;

        const complaint = {
            outlet_id: outlet_id,
            name: name,
            title: title,
            message: message,
            sent_at: sent_at,
            log_last_outlet: log_last_outlet,
            cache_transaction: cache_transaction,
            cache_failed_transaction: cache_failed_transaction,
            cache_success_transaction: cache_success_transaction,
            cache_history_transaction: cache_history_transaction,
        };

        await Complaint.create(complaint);

        return res.status(201).json({
            member: "Data complaint created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Some error occurred while creating complaint",
        });
    }
};