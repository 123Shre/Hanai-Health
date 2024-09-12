const db = require("../../config/database");

class User {
  static async findByEmail(email) {
    const [rows] = await db.execute("SELECT * FROM user WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  // static async create(email, password) {
  //   const [result] = await db.execute(
  //     "INSERT INTO user (email, password) VALUES (?, ?)",
  //     [email, password]
  //   );
  //   return result.insertId;
  // }

  static async updateOTP(userId, otp) {
    await db.execute("UPDATE user SET otp = ? WHERE id = ?", [otp, userId]);
  }

  static async verifyOTP(userId, otp) {
    const [rows] = await db.execute(
      "SELECT * FROM user WHERE id = ? AND otp = ?",
      [userId, otp]
    );
    return rows[0];
  }

  static async getAllUsers() {
    const [rows] = await db.execute(
      "SELECT * FROM user where is_deleted = '0'"
    );
    return rows;
  }

  static async createNewUser(
    firstname,
    lastname,
    email,
    password,
    otp,
    createdAt
  ) {
    // console.log(otp);
    const [result] = await db.execute(
      "INSERT INTO user (firstname,lastname, email, password,otp , created_at) VALUES (?,?,?,?,?,?)",
      [firstname, lastname, email, password, otp, createdAt]
    );
    return result.insertId;
  }

  static async getUserById(user_id) {
    const [rows] = await db.execute("SELECT * FROM user WHERE id = ?", [
      user_id,
    ]);
    return rows[0];
  }

  static async editUser(id, name, email, password) {
    // Replace with your actual database update logic
    const [result] = await db.execute(
      "UPDATE user SET name = ?, email = ?, password = ? WHERE id = ?",
      [name, email, password, id]
    );
    return result.affectedRows;
  }

  static async deleteUser(id) {
    const [result] = await db.execute(
      "UPDATE user SET is_deleted = '1' WHERE id = ?",
      [id]
    );
    return result.affectedRows;
  }

  static async insertSugarLevel(
    userId,
    disease_id,
    before_meal,
    after_meal,
    date,
    time,
    medication
  ) {
    const [result] = await db.execute(
      "INSERT INTO sugar_level (customer_id, disease_id, before_meal, after_meal, date,time,medication) VALUES (?, ?, ?, ?, ?,?,?)",
      [userId, disease_id, before_meal, after_meal, date, time, medication]
    );
    return result.insertId;
  }
  static async getSugardata(user_id, disease_id) {
    const [rows] = await db.execute(
      "SELECT * FROM sugar_level WHERE customer_id = ? AND disease_id = ? ORDER BY id DESC LIMIT 7;",
      [user_id, disease_id]
    );
    // console.log(rows);
    return rows;
  }

  static async getSugardata_forGraph(user_id, disease_id) {
    const [rows] = await db.execute(
      `WITH RankedRecords AS (
            SELECT *,
                   ROW_NUMBER() OVER (PARTITION BY date ORDER BY id DESC) AS rn
            FROM sugar_level
            WHERE customer_id = ? AND disease_id = ?
        )
        SELECT *
        FROM RankedRecords
        WHERE rn = 1
        ORDER BY date ASC
        LIMIT 7;`,
      [user_id, disease_id]
    );
    // console.log(rows);
    return rows;
  }

  static async getPersonalDetails(user_id) {
    const [rows] = await db.execute(
      "select * from personal_details where user_id = ? limit 1",
      [user_id]
    );
    // console.log(rows);
    return result.affectedRows;
  }

  static async storeGraphData(user_id, disease_id, xAxis, yAxis, mealdata) {
    const [result] = await db.execute(
      "INSERT INTO graph (user_id, diease_id, x_axis, y_axis, graphdata) VALUES (?, ?, ?, ?, ?)",
      [user_id, disease_id, xAxis, yAxis, mealdata]
    );

    return result.insertId;
  }
  static async getGraphData(user_id, disease_id) {
    const [rows] = await db.execute(
      "SELECT * FROM graph WHERE user_id = ? AND diease_id = ? ORDER BY id DESC LIMIT 1",
      [user_id, disease_id]
    );
    return rows;
  }
  static async updatePassword(userId, password) {
    const [result] = await db.execute(
      "UPDATE user SET password = ? WHERE id = ?",
      [password, userId]
    );
    return result.affectedRows;
  }
  static async insertBookTest(
    userId,
    labname,
    test_type,
    venue,
    date,
    timeslot
  ) {
    const [result] = await db.execute(
      "INSERT INTO lab_report (customer_id, vendor_id, type, venue, date, time_slot) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, labname, test_type, venue, date, timeslot]
    );
    return result.insertId;
  }
  static async getCartData(user_id) {
    const [rows] = await db.execute(
      "SELECT * FROM cart WHERE user_id = ? ORDER BY id DESC LIMIT 1",
      [user_id]
    );
    return rows;
  }
  // static async createPaymentRecord(product, price, userId) {
  //   const [result] = await db.execute(
  //     "INSERT INTO payments (product, price, user_id, is_paymentsuccess, created_at) VALUES (?, ?, ?, 0, NOW())",
  //     [product, price, userId]
  //   );
  //   return result.insertId;
  // }
  static async setIsActive(id, isActive) {
    const [result] = await db.execute(
      "UPDATE user SET is_active = '1' WHERE id = ?;",
      [id]
    );
    if (isActive == 0) {
      // console.log(isActive, "hjg");
      const [result] = await db.execute(
        "UPDATE user SET is_active = '0' WHERE id = ?",
        [id]
      );
    }

    return result.affectedRows;
  }

  static async checkPassword(userId, providedPassword) {
    // Find the admin by ID to get the stored password
    const [result] = await db.query(
      "SELECT password FROM user WHERE id = ? limit 1",
      [userId]
    );

    if (result.length === 0) {
      throw new Error("User not found");
    }

    const storedPassword = result[0].password;

    // Compare the provided password with the stored password
    return providedPassword === storedPassword;
  }

  static async getBills() {
    // console.log(vendorId);
    const [rows] = await db.execute("SELECT * FROM bill_details");
    // console.log(rows)
    return rows;
  }
  static async addToCart(
    userId,
    product_name,
    image,
    price,
    quantity,
    total_price
  ) {
    // Insert the order into the database
    const query = `
      INSERT INTO cart (user_id, product_name, image, price, quantity, total_price)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [userId, product_name, image, price, quantity, total_price];
    const [result] = await db.execute(query, values);
    return result;
  }

  static async getLowSugarLevelData() {
    const [rows] = await db.execute(
      `SELECT * FROM sugar_level WHERE before_meal < 70 OR after_meal < 140 group by customer_id ORDER BY id;`
    );
    return rows.length;
  }
  static async getHighSugarLevelData() {
    const [rows] = await db.execute(
      `SELECT * FROM sugar_level WHERE before_meal > 130 OR after_meal > 180 group by customer_id ORDER BY id;`
    );
    return rows.length;
  }
  static async getSugarPersons() {
    const [rows] = await db.execute(
      `SELECT DISTINCT customer_id FROM sugar_level`
    );
    return rows.length;
  }
  static async getbooktest(user_id) {
    const [rows] = await db.execute(
      "SELECT lr.*, v.name as vendor_name FROM lab_report lr INNER JOIN vendor v on v.id = lr.vendor_id where lr.customer_id = ? order by lr.id desc",
      [user_id]
    );
    return rows;
  }
  static async addFootSteps(userId, footsteps, date) {
    const [check] = await db.execute(
      "select id from steps_count where date = ? limit 1",
      [date]
    );

    if (check.length == 0) {
      const [result] = await db.execute(
        "INSERT INTO steps_count (user_id, no_of_steps, date) VALUES (?, ?, ?)",
        [userId, footsteps, date]
      );
      return result.insertId;
    } else {
      const [result] = await db.execute(
        "update steps_count set no_of_steps = ? where id = ?",
        [footsteps, check[0].id]
      );
      return result.insertId;
    }
  }
  static async getFootSteps(user_id) {
    const [rows] = await db.execute(
      "SELECT * FROM steps_count where user_id = ? GROUP BY date ORDER BY date ASC limit 7",
      [user_id]
    );
    return rows;
  }
}

module.exports = User;
