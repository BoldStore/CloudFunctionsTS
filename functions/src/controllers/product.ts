import { NextFunction, Request, Response } from "express";
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

    for (let i = 0; i < posts?.length; i++) {
      const post = posts[i];
      await addProduct(storeId, post);
    }

    res.status(200).json({
      success: true,
    });
  } catch (e) {
    next(new ExpressError("Could not get Store Posts", 500, e));
  }
};
