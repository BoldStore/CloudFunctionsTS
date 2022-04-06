import { firestore } from "firebase-admin";
import { getInstaData } from "./get_insta_data";
import { getAccessToken } from "./get_access_token";
import { getStoreData } from "./get_store_data";

export const refresh_store_data = async (
  storeId: string,
  insta_username: string
) => {
  const data = await getInstaData(insta_username);

  await firestore().collection("stores").doc(storeId).set(
    {
      profile_pic: data.profile_pic,
      full_name: data.full_name,
      bio: data.bio,
      followers: data.followers,
      following: data.following,
    },
    { merge: true }
  );

  // Get insta access token
  const auth_data = await getAccessToken();

  await getStoreData(auth_data.user_id, auth_data.access_token, storeId);

  // Get Products which have not been refreshed in the last 10 mins
  const products = (
    await firestore()
      .collection("products")
      .where("store", "==", storeId)
      .where("last_refreshed", "<", new Date().getTime() - 600000)
      .where("sold", "==", false)
      .get()
  ).docs;

  //   TODO: Get data from insta and update our db
};
