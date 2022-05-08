import { https, Request, Response } from "firebase-functions/v1";
import { firestore as firestoredb } from "firebase-admin";
import { handler } from "./helper/file_upload_s3";
import { S3_BUCKET_NAME } from "./secrets";

exports.getProductData = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const storeId: string = req.query.storeId!.toString();

    console.log("STOREID>>>", storeId);

    console.log("BODY>>>>>", req.body);

    const posts = req.body.posts;

    console.log("POSTS", posts?.length);

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

      //   TODO: Analyze the post and get the data

      const product = new Product(
        "",
        "",
        false,
        post.timestamp,
        "",
        "",
        "",
        storeId,
        "",
        "",
        new Date(),
        file_name,
        post_url
      );

      //   Add to firebase
      await firestoredb()
        .collection("products")
        .doc(post.id.toString())
        .set(product);
    }

    res.status(200).json({
      success: true,
    });
  }
);

exports.updateProductData = async (req: Request, res: Response<any>) => {
  const products = (
    await firestoredb().collection("products").where("sold", "==", false).get()
  ).docs;

  // TODO: Get product data from insta

  for (let i = 0; i < products.length; i++) {
    const product_obj = products[i];

    const product = new Product(
      "",
      "",
      false,
      product_obj.data().postedOn,
      "",
      "",
      "",
      product_obj.data().store,
      "",
      "",
      new Date(),
      product_obj.data().file_name,
      product_obj.data().imgUrl
    );

    //   Add to firebase
    await firestoredb()
      .collection("products")
      .doc(product_obj.id.toString())
      .set(product, { merge: true });
  }

  res.status(200).json({
    success: true,
  });
};
