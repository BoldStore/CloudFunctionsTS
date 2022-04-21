import { https, Request, Response } from "firebase-functions/v1";
import { firestore as firestoredb, auth } from "firebase-admin";
import { razorpayInstance } from ".";
import { confirmOrder } from "./helper/order";
import axios from "axios";
import { SHIPROCKET_SERVICEABILITY } from "./constants";
import { sendMail } from "./mails";
import { createShipment } from "./helper/shipping";

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
          currency,
          product.data()!.seller,
          product.data()!.store
        );

        await firestoredb().collection("orders").add(order_obj);
        res.status(201).send({ success: true, order: order_obj });
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

    const user = (await firestoredb().collection("users").doc(id).get()).data();

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
      await createShipment(
        response.order!.data().address,
        orderId,
        response.order!.data().product,
        response.order!.data().store,
        user!
      );
      sendMail(
        user!.email,
        "Product Bought",
        "You just bought a product",
        "./templates/product_bought.html"
      );
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
  const user = (await firestoredb().collection("users").doc(id).get()).data();

  const response = await confirmOrder(
    paymentId,
    orderId,
    razorpaySignature,
    id
  );

  if (response.success) {
    await createShipment(
      response.order!.data().address,
      orderId,
      response.order!.data().product,
      response.order!.data().store,
      user!
    );
    sendMail(
      user!.email,
      "Product Bought",
      "You just bought a product",
      "./templates/product_bought.html"
    );
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

    const orders = await firestoredb()
      .collection("orders")
      .where("user", "==", id)
      .limit(10)
      .get();

    res.status(200).json({
      success: true,
      orders: orders.docs.map((order) => ({
        ...order.data(),
        id: order.id,
      })),
    });
  }
);

exports.checkForDelivery = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const delivery_postcode: string = req.body.postCode;
    const productId: string = req.body.productId;

    const product = (
      await firestoredb().collection("products").doc(productId).get()
    ).data();

    if (!product) {
      res.status(400).send({
        message: "Product not found",
      });
    }
    if (product!.sold) {
      res.status(400).send({
        message: "Product is sold out",
      });
    }

    const seller_id = product!.user;

    const address = (
      await firestoredb()
        .collection("addresses")
        .where("user", "==", seller_id)
        .get()
    ).docs[0];

    const pickup_postcode = address.data().pincode;

    const response = await axios.get(SHIPROCKET_SERVICEABILITY, {
      params: {
        pickup_postcode,
        delivery_postcode,
        cod: 0,
        weight: 0.5,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DELIVERY_API_KEY}`,
      },
    });

    if (response.status !== 200) {
      res.status(500).send({
        message: "Something went wrong",
      });
    }

    res.status(200).json({
      success: true,
      data: response.data.data,
    });
  }
);
