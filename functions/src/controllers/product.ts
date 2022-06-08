import { NextFunction, Request, Response } from "express";
import { firestore } from "firebase-admin";
import { handler } from "../helper/file_upload_s3";
import { analysePost } from "../helper/product";
import { S3_BUCKET_NAME } from "../secrets";
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
      const file_name = (
        post.id + new Date().getUTCMilliseconds().toString()
      ).toString();

      const post_url = await handler({
        fileUrl: post.media_url,
        fileName: file_name,
        bucket: S3_BUCKET_NAME,
      });

      const prod_data = analysePost(post.caption);

      const product = {
        name: prod_data.name,
        size: "",
        sold: prod_data.sold,
        postedOn: post.timestamp,
        amount: prod_data.price,
        likes: "",
        comments: "",
        store: storeId,
        color: "",
        soldOn: null,
        file_name: file_name,
        imgUrl: post_url,
        caption: post?.caption ?? null,
        permalink: post.permalink,
        id: post.id,
      };

      //   Add to firebase
      await firestore().collection("products").add(product);
    }

    res.status(200).json({
      success: true,
    });
  } catch (e) {
    next(new ExpressError("Could not get Store Posts", 500, e));
  }
};
