import { firestore } from "firebase-admin";
import { https, Request, Response } from "firebase-functions/v1";

exports.homePage = https.onRequest(async (req: Request, res: Response<any>) => {
  const products = await firestore()
    .collection("products")
    .where("sold", "!=", true)
    .limit(15)
    .get();

  const stores = await firestore()
    .collection("stores")
    .where("sold", "!=", true)
    .limit(15)
    .get();

  res.status(200).json({
    success: true,
    products,
    stores,
  });
});

exports.explorePage = https.onRequest(
  async (req: Request, res: Response<any>) => {
    var stores: Array<any> = [];
    const products = await firestore()
      .collection("products")
      .where("sold", "!=", true)
      .orderBy("likes")
      .limit(100)
      .get();

    var storeIds = products.docs.map((doc) => doc.data().store);

    for (let i = 0; i < storeIds.length; i++) {
      var id = storeIds[i];
      var store = await firestore().collection("stores").doc(id).get();

      var store_products = await firestore()
        .collection("products")
        .where("store", "==", id)
        .orderBy("likes")
        .limit(5)
        .get();
      var store_products_data = store_products.docs.map((doc) => doc.data());

      stores.push({
        store: store.data(),
        products: store_products_data,
      });
    }

    res.status(200).json({
      success: true,
      stores,
    });
  }
);

exports.store = https.onRequest(async (req: Request, res: Response<any>) => {
  const storeId = req.query.storeId!.toString();

  const store = await firestore().collection("stores").doc(storeId).get();

  const products = await firestore()
    .collection("products")
    .where("store", "==", storeId)
    .limit(30)
    .get();

  res.status(200).json({
    success: true,
    store: store.data(),
    products: products.docs.map((product) => product.data()),
  });
});
