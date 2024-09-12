const jwt = require("jsonwebtoken");
const User = require("../../models/User/user");
const emailService = require("../../utils/emailService");
const { commonFormatResponseToServer } = require("../../helper/common_helper");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Email and password are required",
        {}
      );
      return res.status(200).json(backend_response);
    }

    // Find user by email
    const user = await User.findByEmail(email);
    // Check if user exists
    if (!user) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "User not found",
        {}
      );
      return res.status(200).json(backend_response);
    }
    if (user.is_active == 0) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "User is not active",
        {}
      );
      return res.status(200).json(backend_response);
    }

    if (user.is_deleted == 1) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "User is deleted",
        {}
      );
      return res.status(200).json(backend_response);
    }
    // Compare provided password with stored hashed password
    const isPasswordCorrect = await User.checkPassword(user.id, password);
    // console.log("isPasswordCorrect", isPasswordCorrect);
    if (!isPasswordCorrect) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Password is incorrect",
        {}
      );
      return res.status(200).json(backend_response);
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    // const otp=123;
    // Update OTP in database
    await User.updateOTP(user.id, otp);

    // Send OTP to user's email
    await emailService.sendOTP(email, otp);
    const backend_response = commonFormatResponseToServer(
      true,
      "OTP sent to your email",
      "",
      {}
    );
    // Respond with success message
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
    const user = await User.findByEmail(email);

    if (!user) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "User not found",
        {}
      );
      return res.status(200).json(backend_response);
    }

    const verifiedUser = await User.verifyOTP(user.id, otp);

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

    // Check Routing

    const redirect_fields = User.getPersonalDetails(user.id);
    var route_page = "about";
    if (redirect_fields) {
      route_page = "home";
    }
    // END

    const backend_response = commonFormatResponseToServer(
      true,
      "Token Generated Succssfully",
      "",
      {
        token: token,
        name: user.name,
        route_page: route_page,
      }
    );
    res.status(200).json(backend_response);
  } catch (error) {
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
exports.getSignUp = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const nameParts = name.split(" ");
    const firstname = nameParts[0];
    const lastname = nameParts.length > 1 ? nameParts[1] : "";
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const createdAt = `${year}-${month}-${day}`;
    if (!name || !email || !password) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Name, email, password are required",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const user = await User.findByEmail(email);
    console.log(user)
    if (user) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "User already exists",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    // console.log(otp);
    // const otp = 123;
    await User.createNewUser(
      firstname,
      lastname,
      email,
      password,
      otp,
      createdAt
    );
    // Send email in the background
    await emailService.sendOTP(email, otp);
    const backend_response = commonFormatResponseToServer(
      true,
      "OTP has been sent",
      "",
      {}
    );
    res.status(200).json(backend_response);
  } catch (error) {
    console.error("Error:", error.message);
    const backend_response = commonFormatResponseToServer(
      false,
      "",
      "Server error",
      {}
    );
    res.status(200).json(backend_response);
  }
};

exports.verifySignUpOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "User not found",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const verifiedUser = await User.verifyOTP(user.id, otp);
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
    const backend_response = commonFormatResponseToServer(true, "", "", {
      token: token,
    });
    res.status(200).json(backend_response);
  } catch (error) {
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findByEmail(email);
    console.log(user);
    if (!user) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "User not found",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    // const otp = 123;
    await User.updateOTP(user.id, otp);
    await emailService.sendOTP(email, otp);
    const backend_response = commonFormatResponseToServer(
      true,
      "OTP sent to your email",
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
    const user = await User.findByEmail(email);
    if (!user) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "User not found",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const verifiedUser = await User.verifyOTP(user.id, otp);
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
      "OTP verified successfully",
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
    const user = await User.findByEmail(email);
    if (!user) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "User not found",
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
    await User.updatePassword(user.id, password);
    const backend_response = commonFormatResponseToServer(
      true,
      "Password updated successfully",
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
