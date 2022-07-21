/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { SHIPROCKET_ADDRESSES, SHIPROCKET_LOGIN } from "../constants";
import { firestore } from "firebase-admin";
import { NextFunction, Request, Response } from "express";
import ExpressError = require("../utils/ExpressError");
import { addPickup, createShipment } from "../helper/order/shipping";
import { Address, AddressType } from "../models/address";

export const getAccessToken: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {
  try {
    const config = (await firestore().collection("config").get()).docs[0];

    const email = config.data().shiprocket_email;
    const password = config.data().shiprocket_password;

    const response = await axios.post(SHIPROCKET_LOGIN, {
      email: email,
      password: password,
    });

    const access_token = response.data.token;

    await firestore().collection("config").doc(config.id).update({
      shiprocket_access_token: access_token,
    });

    res.status(200).json({
      success: true,
      access_token,
    });
  } catch (e) {
    next(
      new ExpressError(
        "Could not get access token",
        500,
        (e as any).response.data ?? e
      )
    );
  }
};

export const triggerShipment: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {
  try {
    if (!req.query.orderId) {
      next(new ExpressError("Order ID is required", 400));
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const orderId: string = req.query.orderId!.toString();
    const order = await firestore().collection("orders").doc(orderId).get();

    if (!order.exists) {
      next(new ExpressError("Order not found", 404));
    }

    const product = await firestore()
      .collection("products")
      .doc(order.data()?.product)
      .get();

    if (!product.exists) {
      next(new ExpressError("Product not found", 404));
    }

    const data = await createShipment(
      order.data()?.address_id,
      orderId,
      order.data()?.product,
      product.data()?.store,
      order.data()?.user
    );

    res.status(200).json({
      success: true,
      data,
    });
  } catch (e) {
    next(
      new ExpressError(
        "Could not get trigger order",
        500,
        (e as any).response.data ?? e
      )
    );
  }
};

export const addressToShiprocket: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {
  try {
    if (!req.query.storeId) {
      next(new ExpressError("Store ID is required", 400));
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const storeId: string = req.query.storeId!.toString();
    const store = await firestore().collection("orders").doc(storeId).get();

    if (!store.exists) {
      next(new ExpressError("Order not found", 404));
    }

    const address = await firestore()
      .collection("addresses")
      .where("user", "==", store.id)
      .limit(1)
      .get();

    if (address.docs.length == 0) {
      next(new ExpressError("Address not found", 404));
    }

    const model: AddressType = new Address(
      address.docs[0].id,
      address.docs[0].data()?.address,
      address.docs[0].data()?.name,
      address.docs[0].data()?.addressL1,
      address.docs[0].data()?.addressL2,
      address.docs[0].data()?.city,
      address.docs[0].data()?.state,
      address.docs[0].data()?.pincode,
      address.docs[0].data()?.user,
      address.docs[0].data()?.phone,
      address.docs[0].data()?.notes
    );

    const success = await addPickup(
      address?.docs[0].data()?.name,
      store.data()?.email,
      store.data()?.phone ?? address?.docs[0].data()?.phone,
      model,
      store.id
    );

    res.status(200).json({
      success,
      message: "Added address to shiprocket",
    });
  } catch (e) {
    next(
      new ExpressError(
        "Could not get trigger order",
        500,
        (e as any).response.data ?? e
      )
    );
  }
};

export const getAddresses: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {
  try {
    const config = (await firestore().collection("config").get()).docs[0];
    const access_token = config.data().shiprocket_access_token;
    const response = await axios.get(SHIPROCKET_ADDRESSES, {
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });

    res.status(200).json({
      success: true,
      addresses: response.data.shipping_addresses,
    });
  } catch (e) {
    console.log("Shiprocket addresses error", e);
    next(
      new ExpressError(
        "Could not get access token",
        500,
        (e as any).response.data ?? e
      )
    );
  }
};
