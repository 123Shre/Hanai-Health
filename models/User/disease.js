const db = require("../../config/database");

class Disease {
  static async getAllDisease() {
    const [rows] = await db.execute("SELECT * FROM diease");
    return rows;
  }

  static async getLinkData(userId, diseaseId) {
    try {
      const [rows] = await db.execute(
        "SELECT * FROM customer_record_diease WHERE diease_id = ? AND user_id = ? AND is_selected = ?",
        [diseaseId, userId, '1']
      );
      return rows.length > 0;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }

  static async getLinkDataDiease(userId) {
    try {
      const [rows] = await db.execute(
        "SELECT d.name FROM customer_record_diease cd inner join diease d on d.id = cd.diease_id WHERE cd.user_id = ? AND cd.is_selected = ?",
        [userId, '1']
      );
      return rows;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }


  static async updateLinkData(userId, diseaseId, isSelected) {
    try {
      console.log(isSelected);
      if (isSelected === 0 || isSelected === null) {
        await db.execute(
          "INSERT INTO customer_record_diease (user_id, diease_id, is_selected) VALUES (?, ?, ?)",
          [userId, diseaseId, 1]
        );
      } else {
        await db.execute(
          //   "DELETE FROM customer_record_diease WHERE user_id = ? AND diease_id = ?",
          //   [userId, diease_id]
          //
          "UPDATE customer_record_diease SET is_selected ='0' WHERE user_id = ? AND diease_id = ?",
          [ userId, diseaseId]
        );
      }
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }
  static async getdiseaseCount(diseaseId) {
    try {
      const [rows] = await db.execute(
        `SELECT COUNT(DISTINCT crd.user_id) AS user_count
            FROM diease d
            JOIN customer_record_diease crd ON d.id = crd.diease_id
            LEFT JOIN user u on u.id = crd.user_id
            WHERE crd.is_selected = '1' AND d.id = ? AND u.is_deleted = '0' GROUP BY d.id, d.name`,
        [diseaseId]
      );
      const count = rows.length > 0 ? rows[0].user_count : 0;
      return count;
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }

  static async getAlluserCount() {
    try {
      const [rows] = await db.execute(
        "SELECT COUNT(*) AS user_count FROM user where is_deleted = '0'"
      );
      const count = rows.length > 0 ? rows[0].user_count : 0;
      return count;
    } catch (error) {
      console.error("Error executing query:", error);
    }
  }

  
}
module.exports = Disease;
