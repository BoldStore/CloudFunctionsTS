import { NextFunction, Request, Response } from "express";
import { firestore } from "firebase-admin";
import { razorpayInstance } from "..";
import { confirmOrder } from "../helper/order";
import { Order, OrderType } from "../models/orders";
import ExpressError = require("../utils/ExpressError");

export const createOrder: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {
  try {
    const user = req.user;
    const product_id: string = req.body.product_id;
    const address_id: string = req.body.address_id;
    const currency = "INR";
    const id = user.uid;

    const product = await firestore()
      .collection("products")
      .doc(product_id)
      .get();

    if (!product?.exists) {
      next(new ExpressError("Product not found", 400));
      return;
    }

    if (product.data() && !product.data()?.sold) {
      next(new ExpressError("Product is sold out", 400));
      return;
    }

    if (product.data() && product.data()?.available) {
      next(new ExpressError("Product is not available", 400));
      return;
    }
    // TODO: Check if product is available on insta

    // Make the product unavailable
    await firestore().collection("products").doc(product.id).update({
      available: false,
    });

    // Add to razorpay
    await razorpayInstance.orders
      .create({ amount: product.data()?.price ?? 1000, currency: currency })
      .then(async (order) => {
        const order_obj: OrderType = new Order(
          product.id,
          product.data()?.price ?? 1000,
          undefined,
          order.id,
          address_id,
          currency,
          product.data()?.store,
          undefined,
          new Date(),
          undefined,
          id
        );

        await firestore().collection("orders").add(order_obj);
        res.status(201).json({ success: true, order: order_obj });
      });
  } catch (e) {
    console.log("Error in creating order", e);
    next(new ExpressError("Internal server error", 500, e));
  }
};

export const previousOrders: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {
  try {
    const id = req.user.uid;

    const orders = await firestore()
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
  } catch (e) {
    console.log("Error getting previous orders>>", e);
    next(new ExpressError("Could not get previous orders", 500, e));
  }
};

export const verify: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {
  try {
    const id = req.user.uid;
    const paymentId = req.body.razorpay_payment_id;
    const orderId = req.body.razorpay_order_id;
    const razorpaySignature = req.body.razorpay_signature;

    const user = (await firestore().collection("users").doc(id).get()).data();
    const store = (await firestore().collection("stores").doc(id).get()).data();

    if (user?.exists && store?.exists) {
      next(new ExpressError("User doesn't exists", 400));
    }

    const response = await confirmOrder(
      paymentId,
      orderId,
      razorpaySignature,
      id,
      user?.exists ? user : store
    );

    if (response.success) {
      res.status(200).json({
        success: true,
        message: "Order confirmed",
      });
    } else {
      next(new ExpressError(response.message, 400));
    }
  } catch (e) {
    console.log("Could not verify the order", e);
    next(new ExpressError("Could not verify the order", 500, e));
  }
};

export const callback: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {
  try {
    const id = req.query.id;
    const paymentId = req.body.razorpay_payment_id;
    const orderId = req.body.razorpay_order_id;
    const razorpaySignature = req.body.razorpay_signature;

    if (!id) {
      next(new ExpressError("Invalid request - ID is required", 400));
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId: string = id!.toString();

    const user = (
      await firestore().collection("users").doc(userId).get()
    ).data();
    const store = (
      await firestore().collection("stores").doc(userId).get()
    ).data();

    if (user?.exists && store?.exists) {
      next(new ExpressError("User doesn't exists", 400));
    }

    const response = await confirmOrder(
      paymentId,
      orderId,
      razorpaySignature,
      userId,
      user?.exists ? user : store
    );

    if (response.success) {
      res.status(200).json({
        success: true,
        message: "Order confirmed",
      });
    } else {
      next(new ExpressError(response.message, 400));
    }
  } catch (e) {
    console.log("Could not verify the order", e);
    next(new ExpressError("Could not verify the order", 500, e));
  }
};

export const checkForDelivery: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {};
