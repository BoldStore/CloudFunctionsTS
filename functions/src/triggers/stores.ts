import { document } from "firebase-functions/v1/firestore";
import { addOrUpdateStore, deleteStore } from "../meili/index";

exports.storeDeleted = document("stores/{storeId}").onDelete(
  async (snapshot, context) => {
    deleteStore(context.params.storeId);
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
