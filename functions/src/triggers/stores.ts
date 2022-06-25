import { auth, firestore } from "firebase-admin";
import { document } from "firebase-functions/v1/firestore";
import { deleteByBatching } from "../helper/deletion/batching";
import { deleteObject } from "../helper/s3/file_upload_s3";
import { addOrUpdateStore, deleteStore } from "../meili/index";
import { S3_BUCKET_NAME_PROFILE } from "../secrets";

exports.storeDeleted = document("stores/{storeId}").onDelete(
  async (snapshot, context) => {
    const storeId = context.params.storeId;
    deleteStore(storeId);

    // Delete store url from S3
    await deleteObject({
      bucket: S3_BUCKET_NAME_PROFILE,
      fileName: `${storeId}-profile-pic.jpg`,
    });

    //   Delete payment details
    await firestore().collection("paymentDetails").doc(storeId).delete();

    // Delete Addresses
    const addresses = await firestore()
      .collection("addresses")
      .where("user", "==", storeId)
      .get();

    await deleteByBatching(addresses);

    // Delete Products
    const products = await firestore()
      .collection("products")
      .where("store", "==", storeId)
      .get();

    await deleteByBatching(products);

    //   Delete Authentication
    await auth().deleteUser(storeId);
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
