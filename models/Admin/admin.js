const db = require("../../config/database");

class Admin {
  static async findByEmail(email) {
    const [rows] = await db.execute("SELECT * FROM admin WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  static async create(email, password) {
    const [result] = await db.execute(
      "INSERT INTO admin (email, password) VALUES (?, ?)",
      [email, password]
    );
    return result.insertId;
  }

  static async updateOTP(userId, otp) {
    await db.execute("UPDATE admin SET otp = ? WHERE id = ?", [otp, userId]);
  }

  static async verifyOTP(userId, otp) {
    const [rows] = await db.execute(
      "SELECT * FROM admin WHERE id = ? AND otp = ?",
      [userId, otp]
    );
    return rows[0];
  }
  static async checkPassword(adminId, providedPassword) {
    // Find the admin by ID to get the stored password
    const result = await db.query("SELECT password FROM admin WHERE id = ?", [
      adminId,
    ]);

    if (result.length === 0) {
      throw new Error("Admin not found");
    }
    const storedPassword = result[0][0].password;
    // console.log("stor",storedPassword)
    // console.log("prov",providedPassword)

    // Compare the provided password with the stored password
    return providedPassword === storedPassword;
  }

  static async addUser(name, email, password, createdAt) {
    const [result] = await db.execute(
      "INSERT INTO user (email, password, name,created_at) VALUES (?, ?, ?, ?)",
      [email, password, name, createdAt]
    );
    return result.insertId;
  }
}

module.exports = Admin;
