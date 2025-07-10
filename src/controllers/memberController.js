const Member = require("../models/member");
const moment = require("moment-timezone");

exports.getMembers = async (req, res) => {
    try {
        const result = await Member.getAll();

        return res.status(200).json({
            data: result,
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Failed to fetch members",
        });
    }
};

exports.create = async (req, res) => {
    try {
        const {
            name,
            email,
            phone_number,
            outlet_id
        } = req.body;

        const member = {
            name: name,
            email: email,
            outlet_id: outlet_id,
            phone_number: phone_number,
        };

        await Member.create(member);

        return res.status(201).json({
            member: "Data members created successfully",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Some error occurred while creating members",
        });
    }
};
exports.updatePoint = async (req, res) => {
    try {
        const memberId = req.params.id; // Member ID from the route parameter
        const { points, updated_at } = req.body;  // Expecting points and updated_at in the request body

        // Validate the input data
        if (points == null || updated_at == null) {
            return res.status(400).json({
                code: 400,
                message: "Invalid input. Please provide both points and updated_at."
            });
        }

        // Get current member data from the database
        const member = await Member.getById(memberId);
        
        if (!member) {
            return res.status(404).json({
                code: 404,
                message: "Member not found."
            });
        }

        // Check if the update_at from the request is more recent than the one in the database
        const currentUpdateAt = moment(member.updated_at);
        const newUpdateAt = moment(updated_at);

        if (newUpdateAt.isAfter(currentUpdateAt)) {
            // Prepare the update object for points
            const updatePoints = {
                points: points,
                updated_at: newUpdateAt.toDate(), // Set to new updated_at
            };

            // Update points in the database
            await Member.update(memberId, updatePoints);

            return res.status(200).json({
                code: 200,
                message: "Points updated successfully!",
            });
        } else {
            // If the new updated_at is not more recent
            return res.status(400).json({
                code: 400,
                message: "The provided updated_at is not more recent than the current record."
            });
        }
    } catch (error) {
        console.error(`Error updating points for member ${req.params.id}: ${error.message}`); // Logging with memberId from req.params.id
        return res.status(500).json({
            code: 500,
            message: error.message || "Failed to update points.",
        });
    }
};
exports.update = async (req, res) => {
    try {
        const thisTimeNow = moment();
        const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
        const memberId = req.params.id;
        const {
            name,
            email,
            phone_number,
            outlet_id
        } = req.body;

        const updateMember = {
            name: name,
            email: email,
            phone_number: phone_number,
            outlet_id: outlet_id,
            updated_at: indoDateTime,
        };

        await Member.update(memberId, updateMember);

        return res.status(200).json({
            message: "Berhasil mengubah data member!",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error to update member",
        });
    }
};

exports.delete = async (req, res) => {
    const thisTimeNow = moment();
    const indoDateTime = thisTimeNow.tz("Asia/Jakarta").toDate();
    try {
        const memberId = req.params.id;

        await Member.update(memberId, {
            deleted_at: indoDateTime,
        });

        return res.status(200).json({
            message: "Berhasil menghapus data member",
        });
    } catch (error) {
        return res.status(500).json({
            message: error.message || "Error while deleting member",
        });
    }
};