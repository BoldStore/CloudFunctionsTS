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
import { S3_BUCKET_NAME } from "../../secrets";
import { createProductTask } from "../../tasks/products";
import { deleteObject, handler } from "../s3/file_upload_s3";
import { getInstaData } from "./get_insta_data";

// TODO: Get store in post, think of an optimal solution

export const getStoreData: (
  user_id: string,
  user_id_orignal: string,
  access_token: string,
  storeId: string,
  expires_in?: number,
  tryAgain?: boolean
) => Promise<{ store: StoreType | null; error: any }> = async (
  user_id: string,
  user_id_orignal: string,
  access_token: string,
  storeId: string,
  expires_in = 3600,
  tryAgain = false
) => {
  let store: StoreType | null = null;
  let error: any;
  const insta_id: string = tryAgain ? user_id : user_id_orignal;

  try {
    const response = await axios.get(
      `${INSTAGRAM_GRAPH_API_URL}/${insta_id}?access_token=${access_token}&fields=${BASIC_FIELDS}`
    );

    const username: string = response.data.username;
    const id: string = response.data.id;

    const data = await getInstaData(username);

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
        fileName: `${id}-profile-pic.jpg`,
        bucket: S3_BUCKET_NAME,
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
      user_id,
      access_token
    );

    await auth().updateUser(storeId, {
      photoURL: profilePic ?? "",
      displayName: store.full_name ?? "",
    });

    getStoreMedia(user_id, access_token, storeId);
  } catch (e) {
    if ((e as any).response.data.error.code == 100 && !tryAgain) {
      return await getStoreData(
        user_id,
        user_id_orignal,
        access_token,
        storeId,
        expires_in,
        true
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
) => Promise<boolean> = async (
  user_id: string,
  access_token: string,
  storeId: string
) => {
  try {
    const response = await axios.get(
      `${INSTAGRAM_GRAPH_API_URL}/${user_id}/media?access_token=${access_token}&fields=${MEDIA_FIELDS}`
    );

    if (response.status !== 200) {
      return false;
    }

    const storeMedia: Array<any> = response.data.data;
    createProductTask(storeMedia, storeId);

    return true;
  } catch (e) {
    console.log("There was an error>>>>: ", (e as any).response.data);
    return false;
  }
};
