const db = require("../../config/database");
class BMIdata {
  static async create(weight, height, age, bmi, user_id) {
    // First, check if a record exists for this user
    const [existingRows] = await db.execute(
      "SELECT * FROM bmi_calculator WHERE user_id = ?",
      [user_id]
    );
  
    if (existingRows.length > 0) {
      // Update existing record
      const [result] = await db.execute(
        `UPDATE bmi_calculator 
         SET weight = ?, height = ?, age = ?, bmi = ?
         WHERE user_id = ?`,
        [weight, height, age, bmi, user_id]
      );
      return result.affectedRows;
    } else {
      // Insert new record
      const [result] = await db.execute(
        `INSERT INTO bmi_calculator (weight, height, age, bmi, user_id)
         VALUES (?, ?, ?, ?, ?)`,
        [weight, height, age, bmi, user_id]
      );
      return result.insertId;
    }
  }
  
  static async getBMIData(userId) {
    const [rows] = await db.execute(
      "SELECT * FROM bmi_calculator WHERE user_id = ?",
      [userId]
    );
    return rows;
  }
}
module.exports = BMIdata;
