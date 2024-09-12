const db = require("../../config/database");

class Vendor {
  static async findByEmail(email) {
    const [rows] = await db.execute("SELECT * FROM vendor WHERE email = ?", [
      email,
    ]);

    return rows[0];
  }

  static async create(email, password) {
    const [result] = await db.execute(
      "INSERT INTO vendor (email, password) VALUES (?, ?)",
      [email, password]
    );
    return result.insertId;
  }

  static async updateOTP(userId, otp) {
    await db.execute("UPDATE vendor SET otp = ? WHERE id = ?", [otp, userId]);
  }

  static async checkPassword(vendorId, providedPassword) {
    // Find the admin by ID to get the stored password
    const result = await db.query("SELECT password FROM vendor WHERE id = ?", [
      vendorId,
    ]);

    if (result.length === 0) {
      throw new Error("Vendor not found");
    }

    const storedPassword = result[0][0].password;

    // Compare the provided password with the stored password
    return providedPassword === storedPassword;
  }

  static async verifyOTP(userId, otp) {
    const [rows] = await db.execute(
      "SELECT * FROM vendor WHERE id = ? AND otp = ?",
      [userId, otp]
    );
    return rows[0];
  }
  static async getAllVendor() {
    const [rows] = await db.execute("SELECT * FROM vendor");
    return rows;
  }
  static async createNewVendor(name, email, password, venue, type, createdAt) {
    const [result] = await db.execute(
      "INSERT INTO vendor (name, email, password, venue, type ,created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, password, venue, type, createdAt]
    );
    return result.insertId;
  }
  static async getVendorById(user_id) {
    const [rows] = await db.execute("SELECT * FROM vendor WHERE id = ?", [
      user_id,
    ]);
    return rows[0];
  }
  static async editVendor(id, name, email, password, type, venue) {
    const [result] = await db.execute(
      "UPDATE vendor SET name = ?, email = ?, password = ?, type = ?, venue = ? WHERE id = ?",
      [name, email, password, type, venue, id]
    );
    return result.affectedRows;
  }
  static async deleteVendor(id) {
    // console.log(id)
    const [result] = await db.execute(
      "UPDATE vendor SET is_deleted = '1' WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  }

  static async getAllLabreports(userId) {
    const [rows] = await db.execute(
      "SELECT * FROM lab_report WHERE vendor_id = ? order by id desc",
      [userId]
    );
    console.log(rows);
    return rows;
  }

  static async createNewUser(
    name,
    email,
    password,
    otp,
    test_type,
    venue,
    createdAt
  ) {
    const [result] = await db.execute(
      "INSERT INTO vendor (name, email, password, otp, type, venue,created_at) VALUES (?,?, ?, ?, ?, ?, ?)",
      [name, email, password, otp, test_type, venue, createdAt]
    );
    return result.insertId;
  }

  static async updatePassword(userId, password) {
    const [result] = await db.execute(
      "UPDATE vendor SET password = ? WHERE id = ?",
      [password, userId]
    );
    return result.affectedRows;
  }
  static async getBills(vendorId) {
    // console.log(vendorId);
    const [rows] = await db.execute(
      "SELECT * FROM bill_details WHERE vendor_id = ?",
      [vendorId]
    );
    // console.log(rows)
    return rows;
  }
  static async setIsActive(id, isActive) {
    const [result] = await db.execute(
      "UPDATE vendor SET is_active = '?' WHERE id = ?;",
      [isActive, id]
    );
    // if (isActive == 0) {
    //   // console.log(isActive, "hjg");
    //   const [result] = await db.execute(
    //     "UPDATE vendor SET is_active = '0' WHERE id = ?",
    //     [id]
    //   );
    // }

    return result.affectedRows;
  }
  static async uploadUsersLabReport(userId, customer_id, labReportPath, id) {
    const [result] = await db.execute(
      "UPDATE lab_report SET file_path = ? WHERE vendor_id = ? AND customer_id = ? AND id = ?",
      [labReportPath, userId, customer_id, id]
    );
    return result.affectedRows; // Return the number of rows affected by the update
  }
}

module.exports = Vendor;
