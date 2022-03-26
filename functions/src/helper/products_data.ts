import { Request, Response } from "firebase-functions/v1";
import { firestore as firestoredb } from "firebase-admin";
import { handler } from "./file_upload_s3";

exports.getProductData = async (req: Request, res: Response<any>) => {
  const storeId: string = req.query.storeId!.toString();

  const posts = req.body.posts;

  for (var i = 0; i < posts.length; i++) {
    let post = posts[i];
    const file_name = (
      post.id + new Date().getUTCMilliseconds().toString()
    ).toString();

    const post_url = await handler({
      fileUrl: post.media_url,
      fileName: file_name,
      bucket: process.env.S3_BUCKET_NAME,
    });

    //   TODO: Analyze the post and get the data

    const product = new Product(
      "",
      "",
      "",
      post.timestamp,
      "",
      "",
      "",
      storeId,
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
};
