require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/authRoutes.js");
const bmiRoutes = require("./routes/bmi.routes.js");
const personalInfo = require("./routes/personinfo.routes.js");
const disease = require("./routes/disease.routes.js");
const vendorAuth = require("./routes/Vendor/vendorauth.routes.js");
const adminAuth = require("./routes/Admin/adminauth.routes.js");
const adminNonAuth = require("./routes/Admin/adminnonauth.routes.js");
const vendorNonAuth = require("./routes/Vendor/vendornonauth.routes.js");
const db = require("./config/database.js");
// const cron = require("node-cron");
const bodyParser = require("body-parser");
const cors = require("cors");
const { paymentstripe } = require("./payment/payment.js");
const auth = require("./middleware/auth.js");

const corsOptions = {
  origin: [
      "https://hanai-health-vender.vercel.app",
      "https://hahani-health-admin.vercel.app",
      "https://hanai-health-prototype.vercel.app",
      "http://localhost:3000"
      ], 
  optionsSuccessStatus: 200,
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));
app.use("/auth", authRoutes);
app.use("/health", bmiRoutes);
app.use("/user", personalInfo);
app.use("/disease", disease);
app.use("/vendorauth", vendorAuth);
app.use("/vendor", vendorNonAuth);
app.use("/adminauth", adminAuth);
app.use("/admin", adminNonAuth);
app.use("/paymentstripe", auth, paymentstripe);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
