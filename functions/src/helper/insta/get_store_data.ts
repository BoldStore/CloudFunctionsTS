/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { auth } from "firebase-admin";
import {
  BASIC_FIELDS,
  INSTAGRAM_GRAPH_API_URL,
  MEDIA_FIELDS,
} from "../../constants";
import { Store, StoreType } from "../../models/store";
import { S3_BUCKET_NAME_PROFILE } from "../../secrets";
import { createProductTask } from "../../tasks/products";
import { deleteObject, handler } from "../s3/file_upload_s3";
import { getInstaData } from "./get_insta_data";

export const getStoreData: (
  user_id: string,
  user_id_orignal: string,
  access_token: string,
  storeId: string,
  expires_in?: number,
  tryAgain?: number
) => Promise<{ store: StoreType | null; error: any }> = async (
  user_id,
  user_id_orignal,
  access_token,
  storeId,
  expires_in = 3600,
  tryAgain = 0
) => {
  let store: StoreType | null = null;
  let error: any;
  let insta_id = "";
  switch (tryAgain) {
    case 0:
      insta_id = user_id_orignal;
      break;
    case 1:
      insta_id = user_id;
      break;
    case 2:
      insta_id = "".concat(
        user_id_orignal.slice(0, -1),
        (parseInt(user_id_orignal.slice(-1)) - 1).toString()
      );
      break;

    default:
      return {
        store: null,
        error: `Insta ID doesn't exist: ${user_id_orignal}`,
      };
  }

  if (!access_token) {
    return {
      store,
      error: "No access token",
    };
  }

  try {
    const response = await axios.get(
      `${INSTAGRAM_GRAPH_API_URL}/${insta_id}?access_token=${access_token}&fields=${BASIC_FIELDS}`
    );

    const username: string = response.data.username;
    const id: string = response.data.id;

    const data = await getInstaData(username);

    // Delete if image exists
    await deleteObject({
      bucket: S3_BUCKET_NAME_PROFILE,
      fileName: `${storeId}-profile-pic.jpg`,
    });

    let profilePic = "";
    if (data.profile_pic) {
      // Upload to s3
      profilePic = await handler({
        fileUrl: data.profile_pic!.toString(),
        fileName: `${id}-profile-pic.jpg`,
        bucket: S3_BUCKET_NAME_PROFILE,
      });
    }

    if (data.error) {
      error = data.error;
      return { store, error };
    }

    store = new Store(
      data.full_name ?? "",
      username,
      storeId,
      new Date(),
      data.followers ?? "",
      data.following ?? "",
      profilePic ?? "",
      id,
      data.bio,
      false,
      expires_in,
      insta_id,
      access_token
    );

    await auth().updateUser(storeId, {
      photoURL: profilePic ?? "",
      displayName: store.full_name ?? "",
    });

    await getStoreMedia(insta_id, access_token, storeId);
  } catch (e) {
    if ((e as any).response.data.error.code == 100 && tryAgain <= 2) {
      const again = tryAgain + 1;
      return await getStoreData(
        user_id,
        user_id_orignal,
        access_token,
        storeId,
        expires_in,
        again
      );
    }
    error = (e as any)?.response?.data ?? e;
  }

  return {
    store,
    error,
  };
};

export const getStoreMedia: (
  user_id: string,
  access_token: string,
  storeId: string
) => Promise<boolean> = async (user_id, access_token, storeId) => {
  try {
    const url = `${INSTAGRAM_GRAPH_API_URL}/${user_id}/media?access_token=${access_token}&fields=${MEDIA_FIELDS}`;
    const media = await fetchMedia(url);
    await createProductTask([media], storeId);
    return true;
  } catch (e) {
    console.log("There was an error>>>>: ", (e as any).response.data);
    return false;
  }
};

const fetchMedia: (url?: string) => Promise<Array<any>> = async (url) => {
  if (!url) return [];
  try {
    const response = await axios.get(url);

    const media = await fetchMedia(response.data.paging?.next);

    return [...response.data.data, ...media];
  } catch (e) {
    console.log(
      "There was an error fetching the data at>>>>: ",
      url,
      (e as any).response.data
    );
    return [];
  }
};
