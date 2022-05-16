import { https, Request, Response } from "firebase-functions/v1";
import { firestore as firestoredb } from "firebase-admin";
import { handler } from "./helper/file_upload_s3";
import { S3_BUCKET_NAME } from "./secrets";
import { analysePost } from "./helper/product";

exports.getProductData = https.onRequest(
  async (req: Request, res: Response<any>) => {
    try {
      const storeId: string = req.query.storeId!.toString();

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
        await firestoredb().collection("products").add(product);
      }

      res.status(200).json({
        success: true,
      });
    } catch (e) {
      console.log("There was an error>>>", e);
      res.status(500).json({
        success: false,
        message: "Could not get Store posts",
        error: e,
      });
    }
  }
);

// exports.updateProductData = https.onRequest(
//   async (req: Request, res: Response<any>) => {
//     try {
//       const products = (
//         await firestoredb()
//           .collection("products")
//           .where("sold", "==", false)
//           .get()
//       ).docs;

//       // TODO: Get product data from insta

//       for (let i = 0; i < products.length; i++) {
//         const product_obj = products[i];

//         // const product = new Product(
//         //   "",
//         //   "",
//         //   false,
//         //   product_obj.data().postedOn,
//         //   "",
//         //   "",
//         //   "",
//         //   product_obj.data().store,
//         //   "",
//         //   "",
//         //   new Date(),
//         //   product_obj.data().file_name,
//         //   product_obj.data().imgUrl
//         // );

//         const product = {
//           name: "",
//           size: "",
//           sold: false,
//           postedOn: product_obj.data().postedOn,
//           amount: "",
//           likes: "",
//           comments: "",
//           store: product_obj.data().store,
//           color: "",
//           soldOn: null,
//           file_name: product_obj.data().file_name,
//           imgUrl: product_obj.data().imgUrl,
//           caption: product_obj.data()?.caption,
//           permalink: product_obj.data()?.permalink,
//         };

//         //   Add to firebase
//         await firestoredb()
//           .collection("products")
//           .doc(product_obj.id.toString())
//           .set(product, { merge: true });
//       }

//       res.status(200).json({
//         success: true,
//       });
//     } catch (e) {
//       console.log("Error updating products>>", e);
//       res.status(500).json({
//         success: false,
//         message: "Error Updating Products",
//         error: e,
//       });
//     }
//   }
// );
