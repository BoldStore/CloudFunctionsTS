import { NextFunction, Request, Response } from "express";
import { firestore } from "firebase-admin";
import { addProduct } from "../helper/product";
import ExpressError = require("../utils/ExpressError");

export const getProductData: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {
  try {
    if (!req.query.storeId) {
      next(new ExpressError("Store id is required", 400));
      return;
    }
    const storeId: string = req.query.storeId.toString();

    const posts = req.body.posts;

    // Get store and add a post status
    await firestore().collection("stores").doc(storeId).update({
      postsStatus: "fetching",
    });

    for (let i = 0; i < posts?.length; i++) {
      const post = posts[i];
      await addProduct(storeId, post);
    }

    // Update the post status to completed
    await firestore().collection("stores").doc(storeId).update({
      postsStatus: "completed",
    });

    res.status(200).json({
      success: true,
    });
  } catch (e) {
    next(new ExpressError("Could not get Store Posts", 500, e));
  }
};
