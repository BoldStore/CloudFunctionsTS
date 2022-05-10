import axios from "axios";
import { firestore } from "firebase-admin";
import { INSTAGRAM_GRAPH_API_URL, MEDIA_FIELDS } from "../constants";
import { getAccessToken } from "./get_access_token";
import { getInstaData } from "./get_insta_data";
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

export const getMedia = async (store: any, access_token: string) => {
  const response = await axios.get(
    `${INSTAGRAM_GRAPH_API_URL}/${
      store!.instagram_id
    }/media?access_token=${access_token}&fields=${MEDIA_FIELDS}`
  );

  if (response.status !== 200) {
    console.log("There was an error getting the store's products");
    return {
      success: false,
      error: "There was an error getting the store's products",
      media: [],
    };
  }

  const storeMedia: Array<any> = response.data.data;
  return {
    success: true,
    error: null,
    media: storeMedia,
  };
};

export const refresh_store_products = async (storeId: string) => {
  // Get insta access token
  const store = (
    await firestore().collection("stores").doc(storeId).get()
  ).data();

  const access_token = store!.access_token;

  const username = store!.insta_username;

  const data = await getInstaData(username);

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

  const storeData = await getMedia(store, access_token);
  const media = storeData.media;
  const products = await firestore()
    .collection("products")
    .where("storeId", "==", storeId)
    .where("sold", "==", false)
    .get();

  for (let i = 0; i < media.length; i++) {
    const post = media[i];
    for (let j = 0; j < products.docs.length; j++) {
      const product = products.docs[j];
      if (product.data().id === post.id) {
        // TODO: Maybe check if product is sold and ONLY update that
        // TODO: Or just do this, con: more writes, more money
        const updatedProduct = {
          name: "",
          size: "",
          sold: false,
          amount: "",
          likes: "",
          comments: "",
          color: "",
          caption: post?.caption ?? null,
          permalink: post.permalink,
        };
        await firestore()
          .collection("products")
          .doc(product.id)
          .update(updatedProduct);
      }
    }
  }
};
