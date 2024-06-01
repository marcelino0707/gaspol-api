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