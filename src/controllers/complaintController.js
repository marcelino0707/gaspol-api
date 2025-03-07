const Complaint = require("../models/complaint");
const moment = require("moment-timezone");

exports.getComplaints = async (req, res) => {
    try {
        const result = await Complaint.getAll();

        const parseJSON = (data) => {
            if (typeof data === "string") {
                try {
                    return JSON.parse(data);
                } catch (error) {
                    return {};
                }
            }
            return data && typeof data === "object" ? data : {};
        };

        const transformedResult = result.map((item) => ({
            name: item.name,
            title: item.title,
            message: item.message,
            sent_at: item.sent_at,
            log_last_outlet: parseJSON(item.log_last_outlet),
            cache_transaction: parseJSON(item.cache_transaction),
            cache_failed_transaction: parseJSON(item.cache_failed_transaction),
            cache_success_transaction: parseJSON(item.cache_success_transaction),
            cache_history_transaction: parseJSON(item.cache_history_transaction),
        }));

        return res.status(200).json({
            data: transformedResult,
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
            name, // casher name
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
            log_last_outlet: log_last_outlet ? JSON.stringify(log_last_outlet) : null,
            cache_transaction: cache_transaction ? JSON.stringify(cache_transaction) : null,
            cache_failed_transaction: cache_failed_transaction ? JSON.stringify(cache_failed_transaction) : null,
            cache_success_transaction: cache_success_transaction ? JSON.stringify(cache_success_transaction) : null,
            cache_history_transaction: cache_history_transaction ? JSON.stringify(cache_history_transaction) : null,
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