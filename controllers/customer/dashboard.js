const Disease = require("../../models/User/disease");
const { commonFormatResponseToServer } = require("../../helper/common_helper");
const db = require("../../config/database");
exports.getDisease = async (req, res) => {
  try {
    const { userId } = req.userData;
    // const userId = 3;
    const datas = await Disease.getAllDisease();
    const new_array = [];
    for (data of datas) {
      // Check If data already exist
      const is_selected = await Disease.getLinkData(userId, data.id);

      new_array.push({
        id: data.id,
        name: data.name,
        is_selected: is_selected,
      });
    }
    //   const properDataGet = await Disease.getLinkData(userId, data);
    const backend_response = commonFormatResponseToServer(
      true,
      "Data send successfully",
      "",
      { new_array }
    );
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    res.status(200).json(backend_response);
  }
};

exports.updateDiseaseSelection = async (req, res) => {
  try {
    const { userId } = req.userData;
    const { diseaseId, isSelected } = req.body;
    // console.log(userId, " ", req.body);
    console.log(diseaseId, isSelected);
    const result = await Disease.updateLinkData(userId, diseaseId, isSelected);
    const backend_response = commonFormatResponseToServer(
      true,
      "Selection status updated successfully",
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

exports.updateSelectedInterests = async (req, res) => {
  const { userId } = req.userData;
  const { selectedInterests } = req.body;
  const newselectedInterests = selectedInterests.join(",");
  // console.log(userId," ",selectedInterests?.id)
  // console.log();

  // return res
  // .status(200)
  // .json({ success: false, message: newselectedInterests });
  if (!selectedInterests || !Array.isArray(selectedInterests)) {
    return res
      .status(200)
      .json({ success: false, message: "Invalid data format" });
  }

  try {
      
      await db.query(
        `update customer_record_diease set is_selected = '0'  where user_id = ${userId}`
      );
      
 

    // Update is_selected to true for selected interests
    for (selectedInterest of selectedInterests) {
      //
      const select = `select * from customer_record_diease where user_id = ${userId} and diease_id = ${selectedInterest}`;
      
      const [check_exist] = await db.query(
        `select * from customer_record_diease where user_id = ${userId} and diease_id = ${selectedInterest}`
      );
      
      
      if (check_exist.length > 0) {
        await db.query(
          `UPDATE customer_record_diease SET is_selected = '1' WHERE user_id = ${userId} and diease_id = ${selectedInterest}`
        );
      } else {
        // Insert Query
        await db.query(
          `Insert into customer_record_diease (user_id,diease_id,is_selected) values(?,?,?) `,
          [userId, selectedInterest, "1"]
        );
        // End
      }

      //
    }

    return res
      .status(200)
      .json({ success: true, message: "Interests updated successfully" });
  } catch (error) {
    console.error(error);
    return res
      .status(200)
      .json({ success: false, message: error });
  }
};

// app.get('/countSelectedDiseases', async (req, res) => {
exports.countSelectedDiseases = async (req, res) => {
  const { diseaseIds } = req.body;

  if (!Array.isArray(diseaseIds) || diseaseIds.length === 0) {
    const backend_response = commonFormatResponseToServer(
      false,
      "",
      "diseaseIds must be a non-empty array",
      {}
    );
    return res.status(200).json(backend_response);
  }

  try {
    const usercount = await Disease.getAlluserCount();
    const diseasePercentages = await Promise.all(
      diseaseIds.map(async (id) => {
        const diseasecount = await Disease.getdiseaseCount(id);
        const diseasepercent = (diseasecount / usercount) * 100;
        return { id, percentage: parseFloat(diseasepercent.toFixed(2)) };
      })
    );

    const backend_response = commonFormatResponseToServer(
      true,
      "Data sent successfully",
      "",
      { diseasePercentages }
    );
    return res.status(200).json(backend_response);
  } catch (error) {
    console.error("Error in countSelectedDiseases:", error);
    const backend_response = commonFormatResponseToServer(
      false,
      "",
      "An error occurred while processing the request",
      {}
    );
    return res.status(200).json(backend_response);
  }
};
