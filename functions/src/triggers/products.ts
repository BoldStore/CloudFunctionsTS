import { document } from "firebase-functions/v1/firestore";
import { deleteObject } from "../helper/s3/file_upload_s3";
import { addOrUpdateProduct, deleteProduct } from "../meili/index";
import { S3_BUCKET_NAME } from "../secrets";

exports.productDeleted = document("products/{productId}").onDelete(
  async (snapshot, context) => {
    const product = snapshot.data();
    deleteProduct(context.params.productId);
    // Delete product url from S3
    if (product.type === "CAROUSEL_ALBUM") {
      const images = product.images;
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        await deleteObject({
          bucket: S3_BUCKET_NAME,
          fileName: image.file_name,
        });
      }
    } else {
      await deleteObject({
        bucket: S3_BUCKET_NAME,
        fileName: product.file_name,
      });
    }
  }
);

exports.productCreated = document("products/{productId}").onCreate(
  async (snapshot, context) => {
    const product = snapshot.data();
    addOrUpdateProduct(product, context.params.productId);
  }
);

exports.productUpdated = document("products/{productId}").onUpdate(
  async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();

    if (newValue !== previousValue) {
      addOrUpdateProduct(newValue, context.params.productId);
    }
  }
);
