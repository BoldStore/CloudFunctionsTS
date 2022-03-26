import { https, Request, Response } from "firebase-functions/v1";
import { firestore as firestoredb, auth } from "firebase-admin";
import { razorpayInstance } from ".";
import { confirmOrder } from "./helper/order";

exports.createOrder = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const token = req.headers.authorization!;
    const product_id: string = req.body.product_id;
    const address_id: string = req.body.address_id;
    const currency = "INR";
    const id: string = (await auth().verifyIdToken(token)).uid;

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const product = await firestoredb()
      .collection("products")
      .doc(product_id)
      .get();

    if (!product) {
      res.status(400).send({
        message: "Product not found",
      });
    }

    // TODO: Check if product is available

    // Add to razorpay
    await razorpayInstance.orders
      .create({ amount: product.data()!.price, currency })
      .then(async (order) => {
        const order_obj = new Order(
          product.id,
          product.data()!.price,
          new Date(),
          false,
          order.id,
          "",
          id,
          address_id,
          currency
        );

        await firestoredb().collection("orders").add(order_obj);
        res.status(200).send({ success: true, order_obj });
      });
  }
);

exports.verifyOrder = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const paymentId = req.body.razorpay_payment_id;
    const orderId = req.body.razorpay_order_id;
    const razorpaySignature = req.body.razorpay_signature;

    const token = req.headers.authorization!;
    const id: string = (await auth().verifyIdToken(token)).uid;

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const response = await confirmOrder(
      paymentId,
      orderId,
      razorpaySignature,
      id
    );

    if (response.success) {
      res.status(200).json({
        success: true,
        message: "Order confirmed",
      });
    } else {
      res.status(400).json({
        success: false,
        message: response.message,
      });
    }
  }
);

exports.callback = https.onRequest(async (req: Request, res: Response<any>) => {
  const paymentId = req.body.razorpay_payment_id;
  const orderId = req.body.razorpay_order_id;
  const razorpaySignature = req.body.razorpay_signature;

  const id: string = req.query.id!.toString();

  const response = await confirmOrder(
    paymentId,
    orderId,
    razorpaySignature,
    id
  );

  if (response.success) {
    res.status(200).json({
      success: true,
      message: "Order confirmed",
    });
  } else {
    res.status(400).json({
      success: false,
      message: response.message,
    });
  }
});

exports.previousOrders = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const token = req.headers.authorization!;
    const id: string = (await auth().verifyIdToken(token)).uid;

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const orders = (
      await firestoredb()
        .collection("orders")
        .where("user", "==", id)
        .limit(10)
        .get()
    ).docs;

    res.status(200).json({
      success: true,
      orders,
    });
  }
);
