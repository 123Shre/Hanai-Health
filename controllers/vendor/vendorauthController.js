const jwt = require("jsonwebtoken");
// const User = require("../../models/User/user");
const emailService = require("../../utils/emailService");
const Vendor = require("../../models/Vendor/Vendor");
const { commonFormatResponseToServer } = require("../../helper/common_helper");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Email and password are required",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const user = await Vendor.findByEmail(email);
    if (!user) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Vendor not found",
        {}
      );
      return res.status(200).json(backend_response);
    }
    // console.log(user);
    if(user.is_active==0){
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Vendor is not active",
        {}
      );
      return res.status(200).json(backend_response);
    }
    
    if(user.is_deleted==1){
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Vendor is deleted",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const isPasswordCorrect = await Vendor.checkPassword(user.id, password);
    if (!isPasswordCorrect) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Password is incorrect",
        {}
      );
      return res.status(200).json(backend_response);
    }

    // const otp = Math.floor(100000 + Math.random() * 900000);
    const otp = 123;
    if (user.is_deleted == 0) {
      if (user.is_active == 1) {
        await Vendor.updateOTP(user.id, otp);
        await emailService.sendOTP(email, otp);
        const backend_response = commonFormatResponseToServer(
          true,
          "OTP send successfully",
          "",
          {}
        );
        res.status(200).json(backend_response);
      } else {
        const backend_response = commonFormatResponseToServer(
          false,
          "",
          "Account is not active",
          {}
        );
        res.status(200).json(backend_response);
      }
    } else {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Account is deleted",
        {}
      );
      res.status(200).json(backend_response);
    }
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await Vendor.findByEmail(email);
    if (!user) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Vendor not found",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const verifiedUser = await Vendor.verifyOTP(user.id, otp);
    if (!verifiedUser) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Invalid OTP",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1y",
      }
    );
    const backend_response = commonFormatResponseToServer(
      true,
      "Token Generated",
      "",
      {
        token: token,
      }
    );
    res.status(200).json(backend_response);
  } catch (error) {
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};

exports.getSignUpVendor = async (req, res) => {
  try {
    const { email, password, name, test_type, venue } = req.body;
    // Get the current date
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const createdAt = `${year}-${month}-${day}`;

    if (!name || !email || !password || !test_type || !venue) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "All fields should be filled",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const user = await Vendor.findByEmail(email);
    if (user) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Vendor already exists",
        {}
      );
      return res.status(200).json(backend_response);
    }
    // const otp = Math.floor(100000 + Math.random() * 900000);
    const otp = 123;
    await Vendor.createNewUser(
      name,
      email,
      password,
      otp,
      test_type,
      venue,
      createdAt
    );
    // Send email in the background
    emailService.sendOTP(email, otp);
    const backend_response = commonFormatResponseToServer(
      true,
      "OTP send successfully",
      "",
      {}
    );
    res.status(200).json(backend_response);
  } catch (error) {
    console.error("Error:", error.message);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};

exports.verifySignUpOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await Vendor.findByEmail(email);
    if (!user) {
      return res.status(200).json({ message: "User not found" });
    }
    const verifiedUser = await Vendor.verifyOTP(user.id, otp);
    if (!verifiedUser) {
      return res.status(200).json({ message: "Invalid OTP" });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1y",
      }
    );

    res.status(200).json({
      response: {
        response: true,
        error_msg: "",
        success_msg: "Token Created Successfully",
        data: token,
      },
    });
  } catch (error) {
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await Vendor.findByEmail(email);
    if (!user) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Vendor not found",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    // console.log(otp);
    await Vendor.updateOTP(user.id, otp);
    emailService.sendOTP(email, otp);
    const backend_response = commonFormatResponseToServer(
      true,
      "OTP send successfully. It wil take few minutes.",
      "",
      {}
    );
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};

exports.forgotPassOTPverify = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await Vendor.findByEmail(email);
    if (!user) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Vendor not found",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const verifiedUser = await Vendor.verifyOTP(user.id, otp);
    if (!verifiedUser) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Invalid OTP",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const backend_response = commonFormatResponseToServer(
      true,
      "OTP Verified Successfully",
      "",
      {}
    );
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { email, password, confirmpass } = req.body;
    const user = await Vendor.findByEmail(email);
    if (!user) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Vendor not found",
        {}
      );
      return res.status(200).json(backend_response);
    }
    if (password !== confirmpass) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Password and confirm password does not match",
        {}
      );
      return res.status(200).json(backend_response);
    }
    await Vendor.updatePassword(user.id, password);
    const backend_response = commonFormatResponseToServer(
      true,
      "Password updated successfully",
      "",
      {}
    );
    res.status(200).json(backend_response);
  } catch (error) {
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
