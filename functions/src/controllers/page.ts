/* eslint-disable @typescript-eslint/no-non-null-assertion */
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
  const cursor = req.query.cursor;
  const numberPerPage: number = parseInt(
    req.query.numberPerPage?.toString() ?? "50"
  );

  const storesArray: Array<firestore.DocumentData> = [];
  const productsResponse: Array<any> = [];
  let products: firestore.QuerySnapshot<firestore.DocumentData>;
  let end = false;
  let lastDoc = null;

  try {
    const productQuery = firestore()
      .collection("products")
      .where("sold", "!=", true)
      .orderBy("sold")
      .orderBy("postedOn", "desc")
      .limit(numberPerPage);

    const stores = (
      await firestore()
        .collection("stores")
        .where("isCompleted", "==", true)
        .orderBy("followers", "desc")
        .limit(10)
        .get()
    ).docs;

    if (cursor) {
      const lastProd = await firestore()
        .collection("products")
        .doc(cursor.toString())
        .get();
      products = await productQuery.startAfter(lastProd).get();
    } else {
      products = await productQuery.get();
    }

    lastDoc = products?.docs[products?.docs?.length - 1]?.id;
    end = products?.docs?.length < numberPerPage;

    // Get Stores with products
    for (let i = 0; i < products?.docs?.length; i++) {
      const product = products?.docs[i];
      const storeIndex = storesArray.findIndex(
        (store) => store?.id === product?.data()?.store
      );
      let store;

      // Check if we already got the store
      if (storeIndex === -1) {
        store = await firestore()
          .collection("stores")
          .doc(product.data()?.store)
          .get();

        if (store?.exists && store?.data()) {
          storesArray.push(store.data()!);
          productsResponse.push({
            ...product.data(),
            id: product?.id,
            store: store?.data(),
          });
        }
      } else {
        productsResponse.push({
          ...product.data(),
          id: product?.id,
          store: storesArray[storeIndex],
        });
      }
    }

    res.status(200).json({
      success: true,
      products: productsResponse,
      stores: stores?.map((store) => ({ id: store?.id, ...store?.data() })),
      end,
      lastDoc,
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
    const cursor = req.query.cursor;
    const numberPerPage: number = parseInt(
      req.query.numberPerPage?.toString() ?? "30"
    );

    let products: firestore.QuerySnapshot<firestore.DocumentData>;
    let end = false;
    let lastDoc = null;

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

    const productQuery = firestore()
      .collection("products")
      .where("store", "==", store?.id)
      .orderBy("postedOn", "desc")
      .limit(numberPerPage);

    if (cursor) {
      const lastProd = await firestore()
        .collection("products")
        .doc(cursor.toString())
        .get();
      products = await productQuery.startAfter(lastProd).get();
    } else {
      products = await productQuery.get();
    }

    lastDoc = products?.docs[products?.docs?.length - 1]?.id;
    end = products?.docs?.length < numberPerPage;

    res.status(200).json({
      success: true,
      store: store?.data(),
      products: products.docs.map((product) => ({
        id: product?.id,
        ...product?.data(),
      })),
      end,
      lastDoc,
    });
  } catch (e) {
    console.log("Error getting store>>", e);
    next(new ExpressError("Could not get store", 500, e));
  }
};
