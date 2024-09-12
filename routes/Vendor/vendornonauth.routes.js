const express = require("express");
const router = express.Router();
const vendorNonAuth = require("../../controllers/vendor/vendornonAuthControllers");
const auth = require("../../middleware/auth");
const multer = require("multer");
const path = require("path");
// const authController = require('../controllers/customer/authController');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // Change this to your preferred upload directory
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });
// router.get("/labreport",auth, vendorNonAuth.getAllLabreports);  This needs to be implemented after the demo
router.get("/labreport",auth, vendorNonAuth.getAllLabreports);
// router.get("/update_labreport",auth, vendorNonAuth.updateLabreport);
router.get("/billreport", auth, vendorNonAuth.getAllBills);
router.post("/uploadlabreport",auth, upload.single('labReportPath'),vendorNonAuth.uploadUsersLabReport)
module.exports = router;
