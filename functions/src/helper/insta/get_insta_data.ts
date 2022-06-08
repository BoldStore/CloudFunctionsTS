/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { firestore } from "firebase-admin";
import { InstaData } from "../../interfaces/insta_data";

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
