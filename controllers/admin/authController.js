const jwt = require("jsonwebtoken");
const emailService = require("../../utils/emailService");
const Admin = require("../../models/Admin/admin");
const {commonFormatResponseToServer} = require("../../helper/common_helper");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password are provided
    if (!email || !password) {
      const backend_response = commonFormatResponseToServer(false, "", "Email and password are required", {});
      return res
        .status(200)
        .json(backend_response);
    }

    // Find the admin by email
    const admin = await Admin.findByEmail(email);
    
    // If no admin found, return an error
    if (!admin) {
      const backend_response = commonFormatResponseToServer(false, "", "Admin not found", {});
      return res
        .status(200)
        .json(backend_response);
    }

    // Verify the password (assuming a method `checkPassword` exists)
    const isPasswordCorrect = await Admin.checkPassword(admin.id, password);
    
    if (!isPasswordCorrect) {
      const backend_response = commonFormatResponseToServer(false, "", "Password is incorrect", {});
      return res
        .status(200)
        .json(backend_response);
    }

    // Generate OTP
    // const otp = Math.floor(100000 + Math.random() * 900000);
    const otp = 123;

    // Update the OTP for the admin
    await Admin.updateOTP(admin.id, otp);

    // Send OTP email
     emailService.sendOTP(email, otp);

    // Respond with success
    const backend_response = commonFormatResponseToServer(true, "OTP sent to your email. It will take few minutes", "", {});
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};


exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const admin = await Admin.findByEmail(email);

    if (!admin) {
      const backend_response = commonFormatResponseToServer(false, "", "Admin not found", {});
      return res.status(200).json(backend_response);
    }

    const verifiedUser = await Admin.verifyOTP(admin.id, otp);

    if (!verifiedUser) {
      const backend_response = commonFormatResponseToServer(false, "", "Invalid OTP", {});
      return res.status(200).json(backend_response);
    }

    const token = jwt.sign(
      { userId: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1y",
      }
    );
    const backend_response = commonFormatResponseToServer(true, "", "", {token: token});
    res.status(200).json(backend_response);
  } catch (error) {
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
