import { NextFunction, Request, Response } from "express";
import { firestore } from "firebase-admin";
import { razorpayInstance } from "..";
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
) => Promise<void> = async (req, res, next) => {};

export const verify: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {};

export const callback: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {};

export const checkForDelivery: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {};
