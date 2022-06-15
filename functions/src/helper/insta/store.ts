/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { auth, firestore } from "firebase-admin";
import { INSTAGRAM_GRAPH_API_URL, MEDIA_FIELDS } from "../../constants";
import { getInstaData } from "./get_insta_data";
import { addProduct, analysePost } from "../product/product";
import { S3_BUCKET_NAME } from "../../secrets";
import { deleteObject, handler } from "../s3/file_upload_s3";

interface getMediaResponse {
  success: boolean;
  error: string | null;
  media: Array<any>;
}

export const getMedia: (
  store: FirebaseFirestore.DocumentData,
  access_token: string
) => Promise<getMediaResponse> = async (store: any, access_token: string) => {
  try {
    const response = await axios.get(
      `${INSTAGRAM_GRAPH_API_URL}/${store.instagram_id}/media?access_token=${access_token}&fields=${MEDIA_FIELDS}`
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
  } catch (e) {
    return {
      success: false,
      error: (e as any).response.data,
      media: [],
    };
  }
};

export const refresh_store_products: (
  storeId: string,
  storeFromDb?: FirebaseFirestore.DocumentData | undefined
) => Promise<{ success: boolean; message?: string; error: any }> = async (
  storeId,
  storeFromDb
) => {
  try {
    let store: FirebaseFirestore.DocumentData | undefined;
    // Get insta access token
    if (!storeFromDb) {
      store = (
        await firestore().collection("stores").doc(storeId).get()
      ).data();
    } else {
      store = storeFromDb;
    }

    if (!store) {
      return {
        success: false,
        error: "Store not found",
      };
    }

    const access_token = store?.access_token;

    const username = store?.username;

    const data = await getInstaData(username);

    if (!data.error) {
      // Delete if image exists
      await deleteObject({
        bucket: S3_BUCKET_NAME,
        fileName: `${storeId}-profile-pic.jpg`,
      });

      let profilePic = "";
      if (data.profile_pic) {
        // Upload to s3
        profilePic = await handler({
          fileUrl: data.profile_pic!.toString(),
          fileName: `${storeId}-profile-pic.jpg`,
          bucket: S3_BUCKET_NAME,
        });
      }
      await auth().updateUser(storeId, {
        photoURL: profilePic,
        displayName: data.full_name ?? store.full_name,
      });

      await firestore().collection("stores").doc(storeId).set(
        {
          profile_pic: profilePic,
          full_name: data.full_name,
          bio: data.bio,
          followers: data.followers,
          following: data.following,
        },
        { merge: true }
      );
    }

    const storeData = await getMedia(store, access_token);

    if (!storeData.success) {
      return {
        success: false,
        message: "Could not get store Media",
        error: storeData.error,
      };
    }

    const media = storeData.media;
    const products = await firestore()
      .collection("products")
      .where("storeId", "==", storeId)
      .where("sold", "==", false)
      .get();

    for (let i = 0; i < media.length; i++) {
      const post = media[i];
      let newPost = true;
      for (let j = 0; j < products.docs.length; j++) {
        const product = products.docs[j];
        if (product.data().id === post.id) {
          const prod_data = analysePost(post.caption);
          if (prod_data.sold || prod_data.price != product.data().price) {
            const updatedProduct = {
              name: prod_data.name,
              sold: prod_data.sold,
              amount: prod_data.price,
              caption: post?.caption ?? null,
              permalink: post.permalink,
            };
            await firestore()
              .collection("products")
              .doc(product.id)
              .update(updatedProduct);
          }
          newPost = true;
          break;
        }
      }

      // Add if new Post
      if (newPost) {
        addProduct(storeId, post, access_token, true);
      }
    }

    return {
      success: true,
      error: null,
      message: "Store products refreshed",
    };
  } catch (e) {
    console.log("Refresh products error: ", e);
    return {
      success: false,
      error: e,
      message: "There was an error refreshing the store's products",
    };
  }
};

export const refresh_all_products: () => Promise<void> = async () => {
  try {
    const stores = (await firestore().collection("stores").get()).docs;

    for (let i = 0; i < stores.length; i++) {
      const store = stores[i];
      await refresh_store_products(store.id, store.data());
    }
    return;
  } catch (e) {
    console.log("Updating all products error: ", e);
    return;
  }
};
