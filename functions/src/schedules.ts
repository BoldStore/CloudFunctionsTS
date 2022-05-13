import { firestore } from "firebase-admin";
import { pubsub } from "firebase-functions/v1";
import { refreshToken } from "./helper/get_access_token";
import { refresh_all_products } from "./helper/store";

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
