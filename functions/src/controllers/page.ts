/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { firestore } from "firebase-admin";
import ExpressError = require("../utils/ExpressError");

export const homePage: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await firestore()
      .collection("products")
      .where("sold", "!=", true)
      .limit(15)
      .get();

    const stores = await firestore().collection("stores").limit(50).get();

    res.status(200).json({
      success: true,
      products: products.docs.map((product) => ({
        id: product.id,
        ...product.data(),
      })),
      stores: stores.docs.map((store) => ({
        id: store.id,
        ...store.data(),
      })),
    });
  } catch (e) {
    console.log("Error getting home>>", e);
    next(new ExpressError("Could not get home page", 500, e));
  }
};

export const explorePage: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stores: Array<any> = [];
    const products = await firestore()
      .collection("products")
      .where("sold", "!=", true)
      // .orderBy("likes")
      .limit(100)
      .get();

    const storeIds = products.docs.map((doc) => doc.data().store);

    for (let i = 0; i < storeIds.length; i++) {
      const id = storeIds[i];
      const store = await firestore().collection("stores").doc(id).get();

      const store_products = await firestore()
        .collection("products")
        .where("store", "==", id)
        .orderBy("likes")
        .limit(5)
        .get();
      const store_products_data = store_products.docs.map((doc) => doc.data());

      stores.push({
        store: store.data(),
        products: store_products_data,
      });
    }

    res.status(200).json({
      success: true,
      stores,
    });
  } catch (e) {
    console.log("Error getting explore page>>", e);
    next(new ExpressError("Could not get explore page", 500, e));
  }
};

export const storePage: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const username = req.query.username?.toString();

    if (!username) {
      next(new ExpressError("Store username is required", 400));
      return;
    }

    const store = (
      await firestore()
        .collection("stores")
        .where("username", "==", username)
        .limit(1)
        .get()
    ).docs[0];

    if (!store || !store?.exists) {
      next(new ExpressError("Store not found", 404));
      return;
    }

    const products = await firestore()
      .collection("products")
      .where("store", "==", store.id)
      .limit(30)
      .get();

    res.status(200).json({
      success: true,
      store: store.data(),
      products: products.docs.map((product) => ({
        id: product.id,
        ...product.data(),
      })),
    });
  } catch (e) {
    console.log("Error getting store>>", e);
    next(new ExpressError("Could not get store", 500, e));
  }
};
