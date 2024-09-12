const express = require("express");
const router = express.Router();
const adminNonAuth = require("../../controllers/admin/nonAuthControllers");
const auth = require("../../middleware/auth");
router.post("/adduser", auth, adminNonAuth.addUsers);
router.post("/addvendor", auth, adminNonAuth.addVendor);
router.post("/edituser", auth, adminNonAuth.editUsers);
router.post("/editvendor", auth, adminNonAuth.editVendors);
router.post("/deleteuser", auth, adminNonAuth.deleteUsers);
router.post("/deletevendor", auth, adminNonAuth.deleteVendors);
router.get("/getusers", auth, adminNonAuth.getAllUsers);
router.get("/getvendors", auth, adminNonAuth.getAllVendors);
router.post("/getisactivevendors", auth, adminNonAuth.setIsActiveVendors);
router.post("/getisactiveusers", auth, adminNonAuth.setIsActiveUsers);
router.get("/getbills", auth, adminNonAuth.getBills);
router.post("/getuserbyid",auth,adminNonAuth.getUserByID)
router.post("/getvendorbyid",auth,adminNonAuth.getVendorByID)
module.exports = router;
