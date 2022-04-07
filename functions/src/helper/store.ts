import { firestore } from "firebase-admin";
import { getAccessToken } from "./get_access_token";
import { getStoreData } from "./get_store_data";

export const refresh_store_data = async (
  storeId: string,
  phone_number: string
) => {
  // Get insta access token
  const auth_data = await getAccessToken();

  const data = (
    await getStoreData(auth_data.user_id, auth_data.access_token, storeId)
  ).store;

  if (!data) {
    return;
  }

  await firestore().collection("stores").doc(storeId).set(
    {
      profile_pic: data.profile_pic,
      full_name: data.full_name,
      bio: data.bio,
      followers: data.followers,
      following: data.following,
      insta_username: data.username,
      phone_number,
    },
    { merge: true }
  );
};
