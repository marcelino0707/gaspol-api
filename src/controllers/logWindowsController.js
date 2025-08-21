const LogWindowsClient = require("../models/log_windows_client");

exports.createLog = async (req, res) => {
  try {
    const {
      outlet_id,
      outlet_name,
      log_code,
      log_level, // INFO, WARN, ERROR
      message,
      exception,
      source,
      additional_info,
    } = req.body;

    if (!outlet_id || !outlet_name || !log_level || !message) {
      return res.status(400).json({
        message: "Required fields: outlet_id, outlet_name, log_level, message",
      });
    }

    // Validasi log_level
    const validLogLevels = ['INFO', 'WARN', 'ERROR'];
    if (!validLogLevels.includes(log_level)) {
      return res.status(400).json({
        message: "Invalid log_level. Valid options: INFO, WARN, ERROR",
      });
    }

    const logData = {
      outlet_id,
      outlet_name,
      log_code: log_code || null,
      log_level,
      message,
      exception: exception || null,
      source: source || null,
      additional_info: additional_info || null,
    };

    await LogWindowsClient.create(logData);
    return res.status(201).json({
      message: "Log created successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Some error occurred while creating log",
    });
  }
};

exports.getAllLogs = async (req, res) => {
  try {
    const logs = await LogWindowsClient.getAll();
    return res.status(200).json({
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch logs",
    });
  }
};

exports.getLogsByOutletId = async (req, res) => {
  try {
    const { outlet_id } = req.params;
    const logs = await LogWindowsClient.getByOutletId(outlet_id);
    if (!logs || logs.length === 0) {
      return res.status(404).json({
        message: `No logs found for outlet_id: ${outlet_id}`,
      });
    }
    return res.status(200).json({
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Failed to fetch logs for the specified outlet",
    });
  }
};