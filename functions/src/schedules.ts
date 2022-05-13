import { pubsub } from "firebase-functions/v1";
import { refresh_all_products } from "./helper/store";

exports.refreshStores = pubsub.schedule("every 3 hours").onRun(async (_) => {
  console.log("Refreshing stores");
  await refresh_all_products();
  return null;
});
