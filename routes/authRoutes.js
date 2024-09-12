const express = require('express');
const router = express.Router();
const authController = require('../controllers/customer/authController');

router.post('/login', authController.login);
router.post('/verify-otp', authController.verifyOTP);
router.post('/signup',authController.getSignUp)
router.post('/verifysignupotp',authController.verifySignUpOTP)
router.post('/forgotpass',authController.forgotPassword)
router.post('/forgototpverify',authController.forgotPassOTPverify)
router.post('/changepassword',authController.changePassword)

module.exports = router;