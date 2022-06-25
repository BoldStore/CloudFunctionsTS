/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { firestore } from "firebase-admin";
import { addProduct } from "../helper/product/product";
import ExpressError = require("../utils/ExpressError");

export const getProductData: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {
  if (!req.query.storeId) {
    next(new ExpressError("Store id is required", 400));
    return;
  }
  const storeId: string = req.query.storeId.toString();
  try {
    const posts = req.body.posts;

    // await addProducts(storeId, posts);
    const collection = firestore().collection("products");
    const products: Array<any> = [];

    const store = await firestore().collection("stores").doc(storeId).get();
    const token = store.data()?.access_token;
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      const productData = await addProduct(storeId, post, token);

      console.log("PROD DATA>>", productData?.product?.id);

      if (productData?.product) {
        products.push(productData.product);
      }
    }

    console.log("PRODS>>", products.length);
    //   For faster write times
    await Promise.all(
      products.map((data) => collection.doc(data.id).set(data))
    );

    // Update the post status to completed
    await firestore().collection("stores").doc(storeId).update({
      postsStatus: "completed",
    });

    res.status(200).json({
      success: true,
    });
  } catch (e) {
    console.log("Error saving products>>>", e);
    await firestore().collection("stores").doc(storeId).update({
      postsStatus: "error",
      failedOn: new Date(),
      error: e,
    });
    next(new ExpressError("Could not get Store Posts", 500, e));
  }
};

export const getProduct: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {
  try {
    if (!req.query.productId) {
      next(new ExpressError("Product ID is required", 400));
      return;
    }
    const productId: string = req.query.productId.toString();

    const product = await firestore()
      .collection("products")
      .doc(productId)
      .get();

    if (!product || !product.exists) {
      next(new ExpressError("Product does not exist", 404));
      return;
    }

    const store = await firestore()
      .collection("stores")
      .doc(product.data()?.store)
      .get();

    res.status(200).json({
      success: true,
      product: product.data(),
      store: store.data(),
    });
  } catch (e) {
    next(new ExpressError("Could not get Store Posts", 500, e));
  }
};

export const saveProduct: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {
  try {
    const userId = req?.user?.uid;
    if (!req.body.productId) {
      next(new ExpressError("Product ID is required", 400));
      return;
    }
    const productId: string = req.body.productId.toString();

    const saved = (
      await firestore()
        .collection("saved")
        .where("user", "==", userId)
        .where("product", "==", productId)
        .limit(1)
        .get()
    )?.docs;

    if (saved?.length > 0) {
      next(new ExpressError("Product already saved", 400));
      return;
    }

    const product = await firestore()
      .collection("products")
      .doc(productId)
      .get();

    if (!product || !product.exists) {
      next(new ExpressError("Product does not exist", 404));
      return;
    }

    await firestore().collection("saved").add({
      user: userId,
      product: productId,
    });

    res.status(200).json({
      success: true,
    });
  } catch (e) {
    next(new ExpressError("Could not Save product", 500, e));
  }
};

export const getSavedProducts: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {
  try {
    const userId = req.user.uid;

    const saved = (
      await firestore()
        .collection("saved")
        .where("user", "==", userId)
        .limit(30)
        .get()
    ).docs;

    const storesArray: Array<any> = [];
    const productsArray: Array<any> = [];

    for (let i = 0; i < saved.length; i++) {
      const item = saved[i];
      let exists = false;
      let store = storesArray[0];
      const product = await firestore()
        .collection("products")
        .doc(item.data()?.product)
        .get();

      // Check if the store is already in the array
      for (let j = 0; j < storesArray?.length; j++) {
        const store = storesArray[j];
        if (store?.id === product?.data()?.store) {
          exists = true;
          break;
        }
      }

      if (!exists) {
        const storeData = await firestore()
          .collection("stores")
          .doc(product?.data()?.store)
          .get();

        store = { ...storeData?.data(), id: storeData?.id };

        // Add to array
        storesArray.push({ ...storeData?.data(), id: storeData?.id });
      }

      // Add to products Array
      productsArray.push({
        id: product?.id,
        ...product?.data(),
        store,
      });
    }

    res.status(200).json({
      success: true,
      products: productsArray,
    });
  } catch (e) {
    next(new ExpressError("Could not get Save product", 500, e));
  }
};

export const deleteSavedProduct: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {
  try {
    const userId = req.user.uid;
    if (!req.query.productId) {
      next(new ExpressError("Product ID is required", 400));
      return;
    }
    const productId: string = req.query.productId.toString();

    const saved = (
      await firestore()
        .collection("saved")
        .where("user", "==", userId)
        .where("product", "==", productId)
        .limit(1)
        .get()
    ).docs;

    if (saved.length === 0) {
      next(new ExpressError("Product not saved", 400));
      return;
    }

    const savedId = saved[0].id;

    await firestore().collection("saved").doc(savedId).delete();

    res.status(200).json({
      success: true,
    });
  } catch (e) {
    next(new ExpressError("Could not delete Save product", 500, e));
  }
};
