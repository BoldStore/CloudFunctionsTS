/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, runWith } from "firebase-functions/v1";
import { firestore } from "firebase-admin";
import cors = require("cors");
import { addProduct } from "./helper/product/product";

exports.addData = runWith({
  memory: "2GB",
  timeoutSeconds: 360,
}).https.onRequest(async (req: Request, res: Response<unknown>) => {
  cors({
    origin: true,
  })(req, res, async () => {
    try {
      if (!req.query.storeId) {
        // next(new ExpressError("Store id is required", 400));
        res.status(400).json({
          success: false,
          message: "Store id is required",
        });
        return;
      }
      const storeId: string = req.query.storeId.toString();

      const posts = req.body.posts;

      // Get store and add a post status
      await firestore().collection("stores").doc(storeId).update({
        postsStatus: "fetching",
      });

      // await addProducts(storeId, posts);
      const collection = firestore().collection("products");
      const products: Array<any> = [];

      const store = await firestore().collection("stores").doc(storeId).get();
      const token = store.data()?.access_token;
      for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const productData = await addProduct(storeId, post, token);

        if (productData.product) {
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
      // next(new ExpressError("Could not get Store Posts", 500, e));
      res.status(500).json({
        success: false,
        message: "Could not get Store Posts",
      });
    }
  });
});
