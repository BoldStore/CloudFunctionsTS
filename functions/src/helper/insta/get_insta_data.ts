/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { firestore } from "firebase-admin";
import {
  CHILDREN_FIELDS,
  INSTAGRAM_GRAPH_API_URL,
  MEDIA_FIELDS,
} from "../../constants";
import { InstaData } from "../../interfaces/insta_data";
import { analysePost, PostData } from "../product/product";

export const getInstaData: (username: string) => Promise<InstaData> = async (
  username: string
) => {
  let profile_pic = "";
  let full_name = "";
  let bio = "";
  let followers = "";
  let following = "";
  let error = null;

  try {
    const configs = await firestore().collection("config").get();

    const configData = configs.docs[0].data();
    const ig_app_id = configData.ig_app_id;

    const response = await axios.get(
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
          Accept: "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          "X-Requested-With": "XMLHttpRequest",
          Connection: "keep-alive",
          "X-IG-App-ID": ig_app_id,
        },
      }
    );

    const data = response.data.data;

    profile_pic = data?.user?.profile_pic_url_hd;
    full_name = data?.user?.full_name;
    bio = data?.user?.biography;
    followers = data?.user?.edge_followed_by.count;
    following = data?.user?.edge_follow.count;
  } catch (e) {
    error = (e as any).response.data ?? e;
  }

  return {
    profile_pic,
    full_name,
    bio,
    followers,
    following,
    error,
  };
};

export const getCaraouselMedia: (
  postId: string,
  access_token: string
) => Promise<{ data: any; error: any }> = async (
  postId: string,
  access_token: string
) => {
  let error = null;
  let data = null;
  try {
    const response = await axios.get(
      `${INSTAGRAM_GRAPH_API_URL}/${postId}/children?access_token=${access_token}&fields=${CHILDREN_FIELDS}`
    );

    data = response.data;
  } catch (e) {
    error = (e as any).response.data ?? e;
    console.log("Error in getting caraosule media", error);
  }

  return {
    data,
    error,
  };
};

export const checkIfAvailable: (
  postId: string,
  access_token: string
) => Promise<{ data: PostData | null; error: any }> = async (
  postId,
  access_token
) => {
  let error = null;
  let prod_data = null;
  try {
    const response = await axios.get(
      `${INSTAGRAM_GRAPH_API_URL}/${postId}?access_token=${access_token}&fields=${MEDIA_FIELDS}`
    );

    const data = response.data;
    prod_data = analysePost(data.caption);
  } catch (e) {
    error = (e as any).response.data ?? e;
  }

  return {
    data: prod_data,
    error,
  };
};
