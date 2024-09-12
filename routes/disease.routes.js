const express = require("express");
const auth = require("../middleware/auth");
// const { getDiseases } = require("../controllers/DiseaseControllers");
const { getDisease, updateDiseaseSelection, countSelectedDiseases, updateSelectedInterests } = require("../controllers/customer/dashboard");
const { getSugarLeveldata } = require("../controllers/customer/userControllers");
const router = express.Router();

router.get("/getdisease", auth,  getDisease);//dash
router.post("/updatedisease",auth,updateSelectedInterests)
router.post("/deseasecount",auth,countSelectedDiseases)
router.get("/sugarleveldata",auth,getSugarLeveldata)
module.exports = router;
