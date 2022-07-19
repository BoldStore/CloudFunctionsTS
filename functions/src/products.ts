/* eslint-disable @typescript-eslint/no-explicit-any */
import { onRequest } from "firebase-functions/v2/https";
import { firestore } from "firebase-admin";
import { addProduct } from "./helper/product/product";

exports.adddata = onRequest(
  { timeoutSeconds: 1800, region: ["us-central1"] },
  async (req, res) => {
    if (!req.query.storeId) {
      res.json(400).json({
        success: false,
        message: "Store id is required",
      });
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
      res.status(500).json({
        success: false,
        message: "Could not get Store Posts",
      });
    }
  }
);
