const transporter = require('../config/email');

exports.sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Login OTP',
    text: `Your OTP for login is: ${otp}`
  };

  await transporter.sendMail(mailOptions);
};