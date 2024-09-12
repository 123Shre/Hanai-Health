const multer = require("multer");
const path = require("path");
const db = require("../../config/database");
// const stripe = require("stripe");
const { response } = require("express");
const User = require("../../models/User/user");
const stripe = require("stripe")(process.env.STRIPESECRETKEY);

const { commonFormatResponseToServer } = require("../../helper/common_helper");

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique file name
  },
});

const upload = multer({ storage: storage });






const uploadUserImage = async (req, res) => {
  const uploadSingle = upload.single("image");
  const baseUrl = process.env.APPLICANT_PORTAL_BASE_API_URL;
  const { userId } = req.userData;
  uploadSingle(req, res, async (err) => {
    if (err) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "File upload failed",
        { err: err }
      );
      return res.status(200).json(backend_response);
    }

    const {
      firstname,
      lastname,
      date_of_birth,
      blood_group,
      gender,
      phone_no,
      address,
      city,
      zipcode,
    } = req.body;
    const email = req.userData.email;
    // const userId = req.userData.userId;
    const imagePath = req.file ? req.file.path : null; // Check if file exists
    // const imagePath = filePath ? `${baseUrl}/${filePath}` : null;// Check if file exists

    // Insert user data into the database
    const sql = imagePath
      ? "UPDATE user SET image = ?,firstname=?,lastname=?,date_of_birth = ?,bloodgroup = ?,gender = ?, phone_no = ?,address = ?,city = ?, zipcode = ? WHERE id = ?;"
      : "UPDATE user SET firstname=?,lastname=?, date_of_birth = ?,bloodgroup = ?,gender = ?, phone_no = ?,address = ?,city = ?, zipcode = ? WHERE id = ?;";

    const values = imagePath
      ? [
          imagePath,
          firstname,
          lastname,
          date_of_birth,
          blood_group,
          gender,
          phone_no,
          address,
          city,
          zipcode,
          userId,
        ]
      : [
          // imagePath,
          firstname,
          lastname,
          date_of_birth,
          blood_group,
          gender,
          phone_no,
          address,
          city,
          zipcode,
          userId,
        ];

    try {
      await db.query(sql, values);
      const backend_response = commonFormatResponseToServer(
        true,
        "User data uploaded successfully!",
        "",
        {}
      );
      return res.status(200).json(backend_response);
    } catch (err) {
      console.error("Database error:", err);
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Failed to insert user data",
        { err: err }
      );
      return res.status(200).json(backend_response);
    }
  });
};
const getUserDataByEmail = async (req, res) => {
  const { userId, email } = req.userData; // Get email from req.userData
  //   console.log("Fetching data for userId:", userId);
  try {
    const [results] = await db.execute(
      "SELECT * FROM user WHERE id = ?",
      [userId]
    );
    if (results.length === 0) {
      // Check From User table
      const [userResults] = await db.execute(
        "SELECT * FROM user WHERE id = ? ",
        [userId]
      );
      if (userResults.length > 0) {
       
        const newDataSend = {
          firstname: userResults.firstname,
          lastname: userResults.lastname,
      
          id: "",
          user_id: userId,
          date_of_birth: "0000-00-00",
          blood_group: "",
          gender: "",
          email: userResults?.email,
          phone_no: "",
          address: "",
          city: "",
          zipcode: "",
        };

        const backend_response = commonFormatResponseToServer(true, "", "", {
          userResults,
        });
        return res.status(200).json(backend_response);
      }
      // End
    }
    const backend_response = commonFormatResponseToServer(true, "", "", {
      results,
    });
    return res.status(200).json(backend_response); // Return the first (and only) result
  } catch (error) {
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
const sugarLevelDetails = async (req, res) => {
  try {
    const { userId } = req.userData;
    const { disease_id, before_meal, after_meal, date, time, medication } =
      req.body;
    const result = await User.insertSugarLevel(
      userId,
      disease_id,
      before_meal,
      after_meal,
      date,
      time,
      medication
    );
    const backend_response = commonFormatResponseToServer(
      true,
      "Sugar Level inserted successfully",
      "",
      { result }
    );
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
const graphDataStore = async (req, res) => {
  try {
    const { userId } = req.userData;
    const { disease_id, x_axis, y_axis } = req.body;

    // Get sugar data
    const result = await User.getSugardata(userId, disease_id);

    const beforeMealArray = [];
    const afterMealArray = [];

    // Convert x_axis and y_axis to JSON strings
    const xAxis = JSON.stringify(x_axis);
    const yAxis = JSON.stringify(y_axis);

    // Loop through the data and extract before_meal and after_meal values
    result.forEach((record) => {
      beforeMealArray.push(record.before_meal);
      afterMealArray.push(record.after_meal);
    });

    const data = {
      beforeMealData: beforeMealArray,
      afterMealArray: afterMealArray,
    };

    // Convert data to JSON string
    const mealdata = JSON.stringify(data);

    // Store the graph data
    await User.storeGraphData(userId, disease_id, xAxis, yAxis, mealdata);
    const backend_response = commonFormatResponseToServer(
      true,
      "Data inserted successfully",
      "",
      {}
    );
    // Send success response
    res.status(200).json(backend_response);
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
const graphDataView = async (req, res) => {
  try {
    const { userId } = req.userData;
    const { disease_id } = req.body;
    const result = await User.getGraphData(userId, disease_id);
    if (result.length === 0) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "No data found",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const backend_response = commonFormatResponseToServer(
      true,
      "Data fetched successfully",
      "",
      { result }
    );
    res.status(200).json(backend_response);
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
const getCartData = async (req, res) => {
  try {
    const { userId } = req.userData;
    const result = await User.getCartData(userId);
    if (result.length === 0) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "No data found",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const backend_response = commonFormatResponseToServer(
      true,
      "Data fetched successfully",
      "",
      { result }
    );
    res.status(200).json(backend_response);
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
const addBookTest = async (req, res) => {
  try {
    const { userId } = req.userData;
    const { labname, test_type, venue, date, timeslot } = req.body;
    if (!labname || !test_type || !venue || !date || !timeslot) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "labname, test_type, venue, date and timeslot are required",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const result = await User.insertBookTest(
      userId,
      labname,
      test_type,
      venue,
      date,
      timeslot
    );

    const backend_response = commonFormatResponseToServer(
      true,
      "Data fetched successfully",
      "",
      { result }
    );
    res.status(200).json(backend_response);
  } catch (error) {
    console.error("Error:", error); // Log the error for debugging
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};

const getimageorders = async (req, res) => {
  const { userId } = req.userData;
  const { cartId } = req.body;
  try {
    const [results] = await db.execute(
      "SELECT * FROM cart WHERE id = ? and user_id = ?",
      [cartId, userId]
    );
    if (results.length === 0) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "User not found",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const backend_response = commonFormatResponseToServer(true, "", "", {
      results,
    });
    return res.status(200).json(backend_response); // Return the first (and only) result
  } catch (error) {
    console.error("Database error:", err);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
const createPaymentRecord = async (
  product,
  price,
  quantity,
  cartId,
  userId
) => {
  const [result] = await db.execute(
    "INSERT INTO payments (product, price,cart_id, user_id,quantity, is_paymentsuccess, created_at) VALUES (?, ?,?, ?,?, 0, NOW())",
    [product, price, cartId, userId, quantity]
  );

  // console.log()
  return result.insertId;
};
const addToOrder = async (req, res) => {
  try {
    const { userId } = req.userData;
    const { product_name, price, quantity } = req.body;
    const image = req.file ? req.file.filename : null;

    const total_price = price * quantity;

    // Call addToCart function, passing the image even if it is null
    const result = await User.addToCart(
      userId,
      product_name,
      image,
      price,
      quantity,
      total_price
    );
    const cartId = 1;
    const paymentId = await createPaymentRecord(
      product_name,
      price,
      quantity,
      cartId,
      userId
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: product_name,
            },
            unit_amount: price * 100,
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      client_reference_id: paymentId,
    });

    // res.json();
    console.log(session);
    const backend_response = commonFormatResponseToServer(
      true,
      "Item added to cart successfully",
      "",
      { url: session.url }
    );
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    res.status(500).json(backend_response);
  }
};
const getSugarLeveldata = async (req, res) => {
  try {
    const { userId } = req.userData;
    const disease_id = 1;
    const result = await User.getSugardata_forGraph(userId, disease_id);
    const backend_response = commonFormatResponseToServer(
      true,
      "Data fetched successfully",
      "",
      { result }
    );
    res.status(200).json(backend_response);
  } catch (err) {
    console.log(err);
  }
};

const getBookTest = async (req, res) => {
  try {
    const { userId } = req.userData;
    const result = await User.getbooktest(userId);
    // const result_new = [];
    // For
    // for(result of single){
    //     single.file_path = "http://hanai-customer.techfluxsolutions.com/"+single.file_path;
    //     result_new.push()
    // }

    // // /END

    // const result_new = await result.map((single) => {
    //   single.file_path = "http://hanai-customer.techfluxsolutions.com/"+single.file_path;
    //   return single;
    // });

    const backend_response = commonFormatResponseToServer(
      true,
      "Data fetched successfully",
      "",
      { result }
    );
    res.status(200).json(backend_response);
  } catch (error) {}
};

// Use multer middleware to handle file upload in the route
// app.post("/addToOrder", upload.single("Image"), addToOrder);
const getSugerLevelMatch = async (req, res) => {
  try {
    const lowlevelsugercount = await User.getLowSugarLevelData();
    const highlevelsugarcount = await User.getHighSugarLevelData();
    const allSugarpersons = await User.getSugarPersons();

    // console.log(lowlevelsugercount,highlevelsugarcount,allSugarpersons)
    const lowlevelPercentage = (lowlevelsugercount / allSugarpersons) * 100;
    const highlevelPercentage = (highlevelsugarcount / allSugarpersons) * 100;
    const backend_response = commonFormatResponseToServer(
      true,
      "Data fetched successfully",
      "",
      {
        lowlevelPercentage: lowlevelPercentage,
        highlevelPercentage: highlevelPercentage,
      }
    );
    res.status(200).json(backend_response);
  } catch (err) {
    console.log(err);
    const backend_response = commonFormatResponseToServer(false, "", err, "");
    res.status(200).json(backend_response);
  }
};
const addFootSteps = async (req, res) => {
  try {
    const { userId } = req.userData;
    const { footsteps, date } = req.body;
    const result = await User.addFootSteps(userId, footsteps, date);
    const backend_response = commonFormatResponseToServer(
      true,
      "Footsteps added successfully",
      "",
      { result }
    );
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    res.status(200).json(backend_response);
  }
};

const getFootStepsByID = async (req, res) => {
  try {
    const { userId } = req.userData;
    const result = await User.getFootSteps(userId);
    const backend_response = commonFormatResponseToServer(
      true,
      "Footsteps fetched successfully",
      "",
      { result }
    );
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    res.status(200).json(backend_response);
  }
};

module.exports = {
  uploadUserImage,
  getUserDataByEmail,
  sugarLevelDetails,
  graphDataView,
  graphDataStore,
  getCartData,
  addBookTest,
  getimageorders,
  addToOrder,
  getSugarLeveldata,
  getBookTest,
  getSugerLevelMatch,
  addFootSteps,
  getFootStepsByID,
};
