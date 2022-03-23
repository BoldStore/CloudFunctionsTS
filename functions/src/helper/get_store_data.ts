import axios from "axios";
import {
  BASIC_FIELDS,
  INSTAGRAM_GRAPH_API_URL,
  MEDIA_FIELDS,
} from "../constants";

export const getStoreData = async (
  user_id: string,
  access_token: string,
  userId: string
) => {
  var store: Store | null = null;
  const response = await axios.get(
    `${INSTAGRAM_GRAPH_API_URL}/${user_id}?access_token=${access_token}&fields=${BASIC_FIELDS}`
  );

  if (response.status === 200) {
    const username: string = response.data.username;
    const id: string = response.data.id;

    store = new Store(
      username,
      username,
      userId,
      new Date(),
      undefined,
      undefined,
      undefined,
      id
    );
  }

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
  //   TODO: Schedule a job to save data to firestore

  return true;
};
