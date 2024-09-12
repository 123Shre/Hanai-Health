const express = require("express");
const auth = require("../middleware/auth");
const {
  uploadUserImage,
  getUserDataByEmail,
  sugarLevelDetails,
  graphDataView,
  graphDataStore,
  getCartData,
  addBookTest,
  getimageorders,
  addToOrder,
  getBookTest,
  getSugerLevelMatch,
  addFootSteps,
  getFootStepsByID,
} = require("../controllers/customer/userControllers");
const { paymentstripe } = require("../payment/payment");
const multer = require("multer");
const path = require("path");
const { getAllVendors } = require("../controllers/admin/nonAuthControllers");
// const { addToCart, getCart } = require("../models/User/user");
const router = express.Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

const upload = multer({ storage: storage });
router.post("/formdata", auth, uploadUserImage);
router.get("/getformdata", auth, getUserDataByEmail);
router.post("/sugarlevel", auth, sugarLevelDetails);
router.post("/storegraph", auth, graphDataStore);
router.post("/getgraph", auth, graphDataView);
router.post("/addbooktest", auth, addBookTest);
router.get("/getcart", auth, getCartData);
router.get("/getallvendors", auth, getAllVendors);
router.get("/getbooktest", auth, getBookTest);
// router.post("/payment",auth,paymentstripe)
router.post("/getimageorders", auth, getimageorders);
router.post("/addToOrder", auth, upload.single("image"), addToOrder);
router.get("/getsugarlevelpercenatage", auth, getSugerLevelMatch);
router.post("/addfootsteps", auth, addFootSteps);
router.get("/getfootstepsbyid", auth, getFootStepsByID);
// router.post("/getcart",auth,getCart)
module.exports = router;
