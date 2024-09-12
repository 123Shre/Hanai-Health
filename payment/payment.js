require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPESECRETKEY);
const db = require("../config/database.js");
const cron = require("node-cron");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const app = express();

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

exports.paymentstripe = async (req, res) => {
  const { userId } = req.userData;
  const { product, cartId } = req.body;

  const paymentId = await createPaymentRecord(
    product.name,
    product.price,
    product.quantity,
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
            name: product.name,
          },
          unit_amount: product.price * 100,
        },
        quantity: product.quantity,
      },
    ],
    mode: "payment",
    success_url: "http://localhost:3000/success",
    cancel_url: "http://localhost:3000/cancel",
    client_reference_id: paymentId,
  });

  res.json({ id: session.id });
};

app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        "your-stripe-webhook-secret"
      );
    } catch (err) {
      console.error("⚠️  Webhook signature verification failed.", err.message);
      return res.sendStatus(400);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const paymentId = session.client_reference_id;

      await db.execute(
        "UPDATE payments SET is_paymentsuccess = 1 WHERE id = ?",
        [paymentId]
      );
    }

    res.json({ received: true });
  }
);

const deleteFailedPayments = async () => {
  await db.execute(
    "DELETE FROM payments WHERE is_paymentsuccess = 0 AND created_at < NOW() - INTERVAL 1 DAY"
  );
};

cron.schedule("0 0 * * *", deleteFailedPayments);
