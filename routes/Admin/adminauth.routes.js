const express = require('express');
const router = express.Router();
const adminauthController =require("../../controllers/admin/authController")

router.post('/login', adminauthController.login);
router.post('/verifyotp', adminauthController.verifyOTP);

module.exports = router;