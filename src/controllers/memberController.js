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
exports.updatePoint = async (req, res) => {
    try {
        const memberId = req.params.id; // Member ID from the route parameter
        const { points, updated_at, status, update_from, transaction_ref } = req.body; // Expect points, updated_at, status, and update_from in the request body

        // Validate the input data
        if (points == null || updated_at == null) {
            return res.status(400).json({
                code: 400,
                message: "Invalid input. Please provide both points and updated_at."
            });
        }

        // Fetch current member data from the database
        const member = await Member.getById(memberId);
        
        if (!member) {
            return res.status(404).json({
                code: 404,
                message: "Member not found."
            });
        }

        // Get current points
        const currentPoints = member.points;
        const currentUpdateAt = moment(member.updated_at);
        const newUpdateAt = moment(updated_at);

        // Validate updated_at timestamp
        if (newUpdateAt.isAfter(currentUpdateAt)) {
            let transactionStatus;

            let pointsCalculate;
            // Determine status based on points
            if (status === 'edit') {
                transactionStatus = 'edit'; // If status is 'edit', do not compute points change
                pointsCalculate = points;
                // Update only points in this case
            } else {
                // Calculate if points are being added or subtracted
                if (points > currentPoints) {
                    transactionStatus = 'add'; // More points than current
                    pointsCalculate = points - currentPoints;
                } else if (points < currentPoints) {
                    transactionStatus = 'subtract'; // Fewer points than current
                    pointsCalculate = currentPoints - points;
                } else {
                    transactionStatus = 'edit'; // No change in points
                pointsCalculate = points;
                }
            }
            // Prepare new points based on determined status
            let newPoints = currentPoints; // Start with current points

            newPoints = points;

            // Prepare the update object for points
            const updatePoints = {
                points: newPoints,
                updated_at: newUpdateAt.toDate(),
            };

            // Update member points in the database
            await Member.update(memberId, updatePoints);

            // Prepare the history transaction object
            const historyData = {
                member_id: memberId,
                points: Math.abs(pointsCalculate), // Use the absolute value of points for history
                status: transactionStatus,  // Use the calculated status
                update_from: update_from || 'System', // If not provided, set to null
                transaction_ref: transaction_ref || null,
                created_at: newUpdateAt.toDate(),
                updated_at: newUpdateAt.toDate()
            };

            // Create a transaction history entry
            await Member.createHistoryMemberPoints(historyData);

            return res.status(200).json({
                code: 200,
                message: "Points updated successfully, and transaction history recorded!",
            });
        } else {
            // The updated_at provided is not more recent
            return res.status(400).json({
                code: 400,
                message: "The provided updated_at is not more recent than the current record."
            });
        }
    } catch (error) {
        console.error(`Error updating points for member ${req.params.id}: ${error.message}`);
        return res.status(500).json({
            code: 500,
            message: error.message || "Failed to update points.",
        });
    }
};
exports.getMembersBonusPoint = async (req, res) => {
    try {
        const settings = await Member.getMembersBonusPoint();
        
        return res.status(200).json({
            code: 200,
            data: settings,
            message: "Berhasil mengambil persentase point"
        });
    } catch (error) {
        console.error('Error fetching membership bonus point:', error);
        return res.status(500).json({
            code: 500,
            message: error.message || "Gagal mengambil persentase point"
        });
    }
};

exports.createMembersBonusPoint = async (req, res) => {
    try {
        const { point_percentage, updated_by } = req.body; // Expecting points and updated_by in the request body
        
        // Validate the input data
        if (point_percentage == null || updated_by == null) {
            return res.status(400).json({
                code: 400,
                message: "Invalid input. Please provide both points and updated_by."
            });
        }

        const createdAt = moment().tz("Asia/Jakarta").toDate(); // Get the current time in Jakarta timezone

        // Build the bonus point object
        const bonusPoint = {
            point_percentage: point_percentage,
            updated_by: updated_by,
            updated_at: createdAt // Set the current time
        };

        // Call the method to create the bonus point
        await Member.createMembersBonusPoint(bonusPoint);

        return res.status(201).json({
            code: 201,
            message: "Membership bonus point created successfully!",
        });
    } catch (error) {
        return res.status(500).json({
            code: 500,
            message: error.message || "Some error occurred while creating the membership bonus point.",
        });
    }
};

exports.getAllMembersSettings = async (req, res) => {
    try {
        const result = await Member.getAllMembersSettings();
        return res.status(200).json({
            code: 200,
            data: result,
            message: "Successfully fetched all member settings.",
        });
    } catch (error) {
        return res.status(500).json({
            code: 500,
            message: error.message || "Failed to fetch member settings.",
        });
    }
};

exports.createHistoryPoints = async (req, res) => {
    try {
        const { member_id, points, status, update_from } = req.body;

        // Validate the input data
        if (member_id == null || points == null || !status) {
            return res.status(400).json({
                code: 400,
                message: "Invalid input. Please provide member_id, points, a valid status (add/subtract/edit), and optionally update_from."
            });
        }

        // Build the history data object
        const historyData = {
            member_id,
            points,
            status, // Expected to be 'add', 'subtract', or 'edit'
            update_from: update_from || null, // Optional
            created_at: moment().tz("Asia/Jakarta").toDate(), // Current timestamp
            updated_at: moment().tz("Asia/Jakarta").toDate()  // Current timestamp
        };

        // Call the method to create the history record in the database
        await Member.createHistoryMemberPoints(historyData);

        return res.status(201).json({
            code: 201,
            message: "Membership points transaction recorded successfully!",
        });
    } catch (error) {
        console.error("Error creating member points history:", error);
        return res.status(500).json({
            code: 500,
            message: error.message || "Failed to create membership points transaction.",
        });
    }
};
exports.getMembershipHistory = async (req, res) => {
    try {
        const memberId = req.params.id; // Get member_id from URL parameters

        // Fetch membership history from the model
        const history = await Member.getMembershipHistoryByMemberId(memberId);
        
        return res.status(200).json({
            code: 200,
            data: history,
            message: "Successfully fetched membership history.",
        });
    } catch (error) {
        console.error('Error fetching membership history:', error);
        return res.status(500).json({
            code: 500,
            message: error.message || "Failed to fetch membership history.",
        });
    }
};