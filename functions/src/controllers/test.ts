/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { firestore } from "firebase-admin";
import { deleteStore } from "../helper/deletion/store";
import { getInstaData } from "../helper/insta/get_insta_data";
import { getStoreMedia } from "../helper/insta/get_store_data";
import { addProduct } from "../helper/product/product";
import ExpressError = require("../utils/ExpressError");

// Check if server is up
export const respond = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.json({
    success: true,
    message: "Hello World",
  });
};

// Check if user is logged in
export const checkLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.user.uid;

    const user = (await firestore().collection("users").doc(id).get()).data();

    res.status(200).json({
      success: true,
      user,
      id,
      message: "User logged in",
    });
  } catch (e) {
    next(new ExpressError("Error in checking login", 500, e));
  }
};

export const getInsta = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const insta_username = req.body.insta_username!.toString();

    const data = await getInstaData(insta_username);

    if (!data) {
      next(new ExpressError("No insta data found", 400));
    }

    res.status(200).json({
      success: true,
      insta_username,
      data,
    });
  } catch (e) {
    next(new ExpressError("Error in checking login", 500, e));
  }
};

export const saveProduct: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.uid;
    const post = req.body.post;

    const store = await firestore().collection("stores").doc(userId).get();

    if (!store.exists) {
      next(new ExpressError("Store does not exist", 404));
      return;
    }

    if (!store.data()?.access_token) {
      next(new ExpressError("Store does not have access token", 400));
      return;
    }

    const access_token = store.data()?.access_token;

    addProduct(userId, post, access_token, true);

    res.status(200).json({
      success: true,
      message: "Product added",
    });
  } catch (e) {
    next(new ExpressError("Error in saving store data", 500, e));
  }
};

export const deleteStoreData: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.body.id;

    const store = await firestore().collection("stores").doc(userId).get();

    if (!store.exists) {
      next(new ExpressError("Store does not exist", 404));
      return;
    }

    await deleteStore(userId);

    res.status(200).json({
      success: true,
      message: "Store deleted",
    });
  } catch (e) {
    next(new ExpressError("Error in saving store data", 500, e));
  }
};

export const getMedia: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {
  try {
    const storeId: string = req.query.storeId?.toString() ?? "storeId";

    const store = await firestore().collection("stores").doc(storeId).get();

    if (!store.exists) {
      next(new ExpressError("Store does not exist", 404));
      return;
    }

    const data = await getStoreMedia(
      store.data()?.instagram_id,
      store.data()?.access_token,
      storeId
    );

    res.status(200).json({
      success: data,
      message: data ? "Saved media woho" : "Oh no error",
    });
  } catch (e) {
    next(new ExpressError("Error in saving store data", 500, e));
  }
};
