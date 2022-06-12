import { document } from "firebase-functions/v1/firestore";
import { addOrUpdateProduct, deleteProduct } from "../meili/index";

exports.productDeleted = document("products/{productId}").onDelete(
  async (snapshot, context) => {
    deleteProduct(context.params.productId);
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
