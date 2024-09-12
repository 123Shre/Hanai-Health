const BMIdata = require("../../models/User/bmidata");
const {commonFormatResponseToServer} = require("../../helper/common_helper");

exports.addBMI = async (req, res) => {
  try {
    const { userId } = req.userData;
    const { height, weight, age } = req.body;
    if (!height || !weight) {
      const backend_response = commonFormatResponseToServer(false, "", "Height and weight are required", {});
      return res
        .status(200)
        .json(backend_response);
    }
    const heightInMeters = height / 100; // convert height to meters if provided in cm
    const bmi = weight / (heightInMeters * heightInMeters);
    await BMIdata.create(weight, height, age, bmi.toFixed(2), userId);
    const backend_response = commonFormatResponseToServer(true, "Data Added Successfully", "", {});
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    res.status(200).json(backend_response);
  }
};

exports.getBMI = async (req, res) => {
  try {
    const { userId } = req.userData;
    const data = await BMIdata.getBMIData(userId);
    const backend_response = commonFormatResponseToServer(true, "", "", {
      data: data
    });
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    res.status(200).json(backend_response);
  }
};
