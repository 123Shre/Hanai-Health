const User = require("../../models/User/user");
const Vendor = require("../../models/Vendor/Vendor");
const { commonFormatResponseToServer } = require("../../helper/common_helper");
const Admin = require("../../models/Admin/admin");
const { getDisease } = require("../../controllers/customer/dashboard");
const Disease = require("../../models/User/disease");

exports.addVendor = async (req, res) => {
  // Add vendor
  try {
    const { name, email, password, type, venue } = req.body;
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const createdAt = `${year}-${month}-${day}`;
    if (!name || !email || !password || !venue || !type) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Name, email, password,type and venue are required",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const vendor = await Vendor.findByEmail(email);
    if (vendor) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Vendor already exists",
        {}
      );
      return res.status(200).json(backend_response);
    }
    await Vendor.createNewVendor(name, email, password, venue, type, createdAt);
    const backend_response = commonFormatResponseToServer(
      true,
      "Vendor added successfully",
      "",
      {}
    );
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
exports.addUsers = async (req, res) => {
  // Add users
  try {
    const { email, password, name } = req.body;
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const createdAt = `${year}-${month}-${day}`;
    if (!name || !email || !password) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Name, email, password , createdAt are required",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const user = await User.findByEmail(email);
    if (user) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "User already exists",
        {}
      );
      return res.status(200).json(backend_response);
    }
    await Admin.addUser(name, email, password, createdAt);
    const backend_response = commonFormatResponseToServer(
      true,
      "User added successfully",
      "",
      {}
    );
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
exports.editVendors = async (req, res) => {
  // Edit vendors
  try {
    const { email, password, name, id, type, venue } = req.body;
    if (!name || !email || !password || !id || !type || !venue) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Name, email, password, id, type and venue are required",
        {}
      );
      return res.status(200).json(backend_response);
    }

    const vendor = await Vendor.findByEmail(email);
    if (vendor && vendor.id != id) {
      // Ensure the email is not used by another vendor
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Email already in use by another vendor",
        {}
      );
      return res.status(200).json(backend_response);
    }
    1;
    const updatedRows = await Vendor.editVendor(
      id,
      name,
      email,
      password,
      type,
      venue
    );
    if (updatedRows) {
      const backend_response = commonFormatResponseToServer(
        true,
        "Vendor updated successfully",
        "",
        {}
      );
      return res.status(200).json(backend_response);
    } else {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Vendor not updated",
        {}
      );
      return res.status(200).json(backend_response);
    }
  } catch (error) {
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};

exports.editUsers = async (req, res) => {
  // Edit users
  try {
    const { email, password, name, id } = req.body;
    if (!name || !email || !password || !id) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Name, email, password, and id are required",
        {}
      );
      return res.status(200).json(backend_response);
    }

    const user = await User.findByEmail(email);
    if (user && user.id !== id) {
      // Ensure the email is not used by another user
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Email already in use by another user",
        {}
      );
      return res.status(200).json(backend_response);
    }

    const updatedRows = await User.editUser(id, name, email, password);
    if (updatedRows) {
      const backend_response = commonFormatResponseToServer(
        true,
        "User updated successfully",
        "",
        {}
      );
      return res.status(200).json(backend_response);
    } else {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "User not found",
        {}
      );
      return res.status(200).json(backend_response);
    }
  } catch (error) {
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
exports.getAllVendors = async (req, res) => {
  // Get all vendors
  try {
    const vendors = await Vendor.getAllVendor();
    res.status(200).json({
      response: {
        response: true,
        error_msg: "",
        success_msg: "",
        data: vendors,
      },
    });
  } catch (error) {
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};

const getDieasesByUser = async (userId) => {
  
  const diseases = await Disease.getLinkDataDiease(userId);

  const newD = diseases.map((disease) => {
    return disease.name;
  });

  return newD.join(",");
}

exports.getAllUsers = async (req, res) => {
  // Get all users\
  try {
    const users = await User.getAllUsers();
    const NewArry = [];
    for (user of users) {
      const userId = user.id;
      
      user.diseases = await getDieasesByUser(userId);

      NewArry.push(user);
    }
    // console.log()

    const backend_response = commonFormatResponseToServer(
      true,
      "",
      "",
      NewArry
    );
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};

exports.deleteVendors = async (req, res) => {
  // Delete vendors
  try {
    const { id } = req.body;
    const vendor = await Vendor.getVendorById(id);
    if (!vendor) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Vendor not found",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const deletedRows = await Vendor.deleteVendor(id);
    if (deletedRows) {
      const backend_response = commonFormatResponseToServer(
        true,
        "Vendor deleted successfully",
        "",
        {}
      );
      return res.status(200).json(backend_response);
    } else {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Vendor not deleted",
        {}
      );
      return res.status(200).json(backend_response);
    }
  } catch (error) {
    console.error("Error deleting vendor:", error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
exports.deleteUsers = async (req, res) => {
  // Delete users
  try {
    const { id } = req.body;
    const user = await User.getUserById(id);
    if (!user) {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "User not found",
        {}
      );
      return res.status(200).json(backend_response);
    }
    const deletedRows = await User.deleteUser(id);
    if (deletedRows) {
      const backend_response = commonFormatResponseToServer(
        true,
        "User deleted successfully",
        "",
        {}
      );
      return res.status(200).json(backend_response);
    } else {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "User not deleted",
        {}
      );
      return res.status(200).json(backend_response);
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
exports.getBills = async (req, res) => {
  // Get bills
  try {
    const bills = await User.getBills();
    const backend_response = commonFormatResponseToServer(true, "", "", {
      bills,
    });
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
exports.getUserByID = async (req, res) => {
  // Get user by ID
  try {
    const { id } = req.body;
    const user = await User.getUserById(id);
    user.diseases = await getDieasesByUser(user.id);
    const backend_response = commonFormatResponseToServer(true, "", "", {
      user,
    });
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};

exports.getVendorByID = async (req, res) => {
  // Get vendor by ID
  try {
    const { id } = req.body;
    const vendor = await Vendor.getVendorById(id);
    const backend_response = commonFormatResponseToServer(true, "", "", {
      vendor,
    });
    res.status(200).json(backend_response);
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
exports.setIsActiveVendors = async (req, res) => {
  // Set is active vendors
  try {
    const { id, isActive } = req.body;
    const updatedRows = await Vendor.setIsActive(id, isActive);

    //   return res.status(200).json(updatedRows);
    if (updatedRows) {
      const backend_response = commonFormatResponseToServer(
        true,
        "Vendor updated successfully",
        "",
        {}
      );
      return res.status(200).json(backend_response);
    } else {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "Vendor not updated",
        {}
      );
      return res.status(200).json(backend_response);
    }
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
exports.setIsActiveUsers = async (req, res) => {
  // Set is active vendors
  try {
    const { id, isActive } = req.body;
    const updatedRows = await User.setIsActive(id, isActive);
    if (updatedRows) {
      const backend_response = commonFormatResponseToServer(
        true,
        "User updated successfully",
        "",
        {}
      );
      return res.status(200).json(backend_response);
    } else {
      const backend_response = commonFormatResponseToServer(
        false,
        "",
        "User not updated",
        {}
      );
      return res.status(200).json(backend_response);
    }
  } catch (error) {
    console.error(error);
    const backend_response = commonFormatResponseToServer(false, "", error, {});
    return res.status(200).json(backend_response);
  }
};
