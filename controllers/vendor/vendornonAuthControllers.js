const Vendor = require("../../models/Vendor/Vendor");
const { commonFormatResponseToServer } = require("../../helper/common_helper");
const multer = require("multer");
const path = require("path");

exports.getAllBills = async (req, res) => {
  try {
    const { userId } = req.userData;
    const bills = await Vendor.getBills(userId);
    // console.log(bills);
    const backend_response = commonFormatResponseToServer(true, "", "", {
      bills,
    });
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    res.status(200).json(backend_response);
  }
};
exports.getAllLabreports = async (req, res) => {
  try {
    const { userId } = req.userData;
    const labreports = await Vendor.getAllLabreports(userId);
    console.log(labreports);
    const backend_response = commonFormatResponseToServer(true, "", "", {
      labreports,
    });
    res.status(200).json(backend_response);
  } catch (error) {
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    res.status(200).json(backend_response);
  }
};

exports.uploadUsersLabReport = async (req, res) => {
  try {
    const { userId } = req.userData; // Assuming this is populated by some middleware
    // const labReportPath = req.file.path;
    const baseUrl = process.env.APPLICANT_PORTAL_BASE_API_URL;

    const labReportPath = req.file ? req.file.path : null; // Check if file exists
    // const labReportPath = filePath ? `${baseUrl}/${filePath}` : null;
    const { customer_id, id } = req.body;
    const result = await Vendor.uploadUsersLabReport(
      userId,
      customer_id,
      labReportPath,
      id
    );
    const backend_response = commonFormatResponseToServer(
      true,
      "Labreport uploaded successfully",
      "",
      {
        result,
      }
    );
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    res.status(200).json(backend_response);
  }
};
