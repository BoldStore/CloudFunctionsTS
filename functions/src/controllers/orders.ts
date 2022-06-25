/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { firestore } from "firebase-admin";
import { razorpayInstance } from "..";
import { SHIPROCKET_SERVICEABILITY } from "../constants";
import { checkIfAvailable } from "../helper/insta/get_insta_data";
import { confirmOrder } from "../helper/order/order";
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

    if (product.data() && product.data()?.sold) {
      next(new ExpressError("Product is sold out", 400));
      return;
    }

    if (product.data() && product.data()?.available) {
      next(new ExpressError("Product is not available", 400));
      return;
    }

    const userInDb = await firestore().collection("users").doc(id).get();

    if (!userInDb?.exists) {
      const storeInDb = await firestore().collection("stores").doc(id).get();

      if (!storeInDb?.exists) {
        next(new ExpressError("User not found", 400));
        return;
      }

      if (!storeInDb.data()?.isCompleted) {
        next(new ExpressError("User not completed profile", 400));
        return;
      }
    }

    // if (!userInDb.data()?.isCompleted) {
    //   next(new ExpressError("Please complete your profile", 400));
    //   return;
    // }

    // Check if store is completed
    const store = await firestore()
      .collection("stores")
      .doc(product.data()?.store)
      .get();

    if (!store?.exists) {
      next(new ExpressError("Store not found", 400));
      return;
    }

    if (!store.data()?.isCompleted) {
      next(new ExpressError("Store is not completed", 400));
      return;
    }

    const data = await checkIfAvailable(
      product.data()?.insta_id,
      store.data()?.access_token
    );

    if (data.data?.sold) {
      await firestore().collection("products").doc(product_id).update({
        sold: true,
      });
      next(new ExpressError("Product is sold out", 400));
      return;
    }

    if (data.data?.price !== product.data()?.price) {
      await firestore().collection("products").doc(product_id).update({
        amount: data.data?.price,
      });
      next(
        new ExpressError(
          "Product price changed. Are you sure you want to continue?",
          400
        )
      );
      return;
    }

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

    const orders = (
      await firestore()
        .collection("orders")
        .where("user", "==", id)
        .limit(10)
        .get()
    ).docs;

    const storesArray: Array<any> = [];
    const ordersArray: Array<any> = [];

    for (let i = 0; i < orders?.length; i++) {
      const order = orders[i];
      let exists = false;
      let store = storesArray[0];
      const product = await firestore()
        .collection("products")
        .doc(order.data()?.product)
        .get();

      // Check if the store is already in the array
      for (let j = 0; j < storesArray?.length; j++) {
        const store = storesArray[j];
        if (store?.id === order?.data()?.store) {
          exists = true;
          break;
        }
      }

      if (!exists) {
        const storeData = await firestore()
          .collection("stores")
          .doc(order?.data()?.store)
          .get();

        store = { ...storeData?.data(), id: storeData?.id };

        // Add to array
        storesArray.push({ ...storeData?.data(), id: storeData?.id });
      }

      // Add to products Array
      ordersArray.push({
        id: order?.id,
        ...order?.data(),
        store,
        product: {
          ...product?.data(),
          id: product.id,
        },
      });
    }

    res.status(200).json({
      success: true,
      orders: ordersArray,
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
      if (response.type == "SHIPMENT_ERROR") {
        res.status(200).json({
          success: true,
          message: "Shipment Error",
        });
      }
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
) => Promise<void> = async (req, res, next) => {
  try {
    const delivery_postcode: string = req.body.postCode;
    const productId: string = req.body.productId;

    const config = (await firestore().collection("config").limit(1).get())
      .docs[0];

    const product = (
      await firestore().collection("products").doc(productId).get()
    ).data();

    if (!product) {
      next(new ExpressError("Product not found", 400));
      return;
    }

    if (!product?.available) {
      next(new ExpressError("Product is sold out", 400));
      return;
    }

    if (product?.sold) {
      next(new ExpressError("Product is sold out", 400));
      return;
    }

    const seller_id = product?.store;

    const address = (
      await firestore()
        .collection("addresses")
        .where("user", "==", seller_id)
        .limit(1)
        .get()
    ).docs[0];

    const pickup_postcode = address.data().pincode;

    const response = await axios.get(SHIPROCKET_SERVICEABILITY, {
      params: {
        pickup_postcode,
        delivery_postcode,
        cod: 0,
        weight: 1,
      },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.data().shiprocket_access_token}`,
      },
    });

    res.status(200).json({
      success: true,
      data: response.data.data,
    });
  } catch (e) {
    console.log(
      "Getting delivery status failed>>",
      (e as any).response?.data ?? e
    );
    res.status(500).json({
      success: false,
      message: "Could not get delivery status",
      error: (e as any).response.data ?? e,
    });
  }
};
