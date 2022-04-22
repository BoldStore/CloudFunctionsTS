import axios from "axios";
import {
  BASIC_FIELDS,
  INSTAGRAM_GRAPH_API_URL,
  MEDIA_FIELDS,
} from "../constants";
import { createProductTask } from "../tasks/products";
import { getInstaData } from "./get_insta_data";

export const getStoreData = async (
  user_id: string,
  access_token: string,
  storeId: string
) => {
  let store: Store | null = null;
  const response = await axios.get(
    `${INSTAGRAM_GRAPH_API_URL}/${user_id}?access_token=${access_token}&fields=${BASIC_FIELDS}`
  );

  if (response.status === 200) {
    const username: string = response.data.username;
    const id: string = response.data.id;

    const data = await getInstaData(username);

    store = new Store(
      data.full_name,
      username,
      storeId,
      new Date(),
      data.followers,
      data.following,
      data.profile_pic,
      id,
      data.bio
    );
  }

  await getStoreMedia(user_id, access_token, storeId);

  return {
    store,
  };
};

export const getStoreMedia = async (
  user_id: string,
  access_token: string,
  storeId: string
) => {
  const response = await axios.get(
    `${INSTAGRAM_GRAPH_API_URL}/${user_id}/media?access_token=${access_token}&fields=${MEDIA_FIELDS}`
  );

  if (response.status !== 200) {
    return false;
  }

  const storeMedia: Array<any> = response.data.data;
  createProductTask(storeMedia, storeId);

  return true;
};
