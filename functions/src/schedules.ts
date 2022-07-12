/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from "axios";
import { firestore } from "firebase-admin";
import { pubsub } from "firebase-functions/v1";
import { subMinutes } from "./helper/date";
import { refreshToken } from "./helper/insta/get_access_token";
import { refresh_all_products } from "./helper/insta/store";

exports.refershServices = pubsub
  .schedule("every day 00:00")
  .onRun(async (context) => {
    try {
      const response = await axios.get("/shipping-getShiprocketAccessToken");
      const access_token = response.data.access_token;
      const config = (await firestore().collection("config").get()).docs[0];

      await firestore().collection("config").doc(config.id).update({
        shiprocket_access_token: access_token,
      });
    } catch (e) {
      console.log("Refresh shiprocket token error", e);
    }
    return null;
  });

exports.refreshStores = pubsub.schedule("every 3 hours").onRun(async (_) => {
  console.log("Refreshing stores");
  await refresh_all_products();
  return null;
});

exports.refreshStoreTokens = pubsub
  .schedule("every 1 hours")
  .onRun(async (_) => {
    console.log("Refreshing store tokens");
    // const date = new Date();
    const stores = await firestore().collection("stores").get();

    for (let i = 0; i < stores.docs.length; i++) {
      const store = stores.docs[i];

      const access_token = store.data().access_token;
      // const expires_in = store.data().expires_in;

      const auth_data = await refreshToken(access_token);

      if (!auth_data.error) {
        await firestore().collection("stores").doc(store.id).update({
          access_token: auth_data.access_token,
          expires_in: auth_data.expires_in,
        });
      }
    }
  });

exports.removeExpiredOrders = pubsub
  .schedule("every minute")
  .onRun(async (_) => {
    const orders = await firestore()
      .collection("orders")
      .where("status", "==", "pending")
      .where("createdAt", ">=", subMinutes(new Date(), 30))
      .get();

    for (let i = 0; i < orders.docs.length; i++) {
      const order = orders.docs[i];
      await firestore().collection("orders").doc(order.id).update({
        status: "expired",
      });

      await firestore()
        .collection("products")
        .doc(order.data().productId)
        .update({
          available: true,
        });
    }
  });
