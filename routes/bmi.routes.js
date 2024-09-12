const express = require("express");
const auth = require("../middleware/auth");
const BMI = require("../controllers/customer/BMI");
const router = express.Router();

router.post("/bmi_info", auth, BMI.addBMI);
router.get("/bmi_info", auth, BMI.getBMI);
module.exports = router;
