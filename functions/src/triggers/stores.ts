import { document } from "firebase-functions/v1/firestore";
import { deleteObject } from "../helper/s3/file_upload_s3";
import { addOrUpdateStore, deleteStore } from "../meili/index";
import { S3_BUCKET_NAME_PROFILE } from "../secrets";

exports.storeDeleted = document("stores/{storeId}").onDelete(
  async (snapshot, context) => {
    deleteStore(context.params.storeId);

    // Delete store url from S3
    await deleteObject({
      bucket: S3_BUCKET_NAME_PROFILE,
      fileName: `${context.params.storeId}-profile-pic.jpg`,
    });
  }
);

exports.storeCreated = document("stores/{storeId}").onCreate(
  async (snapshot, context) => {
    const store = snapshot.data();
    addOrUpdateStore(store, context.params.storeId);
  }
);

exports.storeUpdated = document("stores/{storeId}").onUpdate(
  async (change, context) => {
    const newValue = change.after.data();
    const previousValue = change.before.data();

    if (newValue !== previousValue) {
      addOrUpdateStore(newValue, context.params.storeId);
    }
  }
);
