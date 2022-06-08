/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { SHIPROCKET_ADDRESSES, SHIPROCKET_LOGIN } from "../constants";
import { firestore } from "firebase-admin";
import { NextFunction, Request, Response } from "express";
import ExpressError = require("../utils/ExpressError");

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
