import axios from "axios";
import { INSTA_COOKIE } from "../secrets";

export const getInstaData = async (username: string) => {
  const response = await axios.get(
    `https://www.instagram.com/${username}/?__a=1`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "X-Requested-With": "XMLHttpRequest",
        Connection: "keep-alive",
        cookie: INSTA_COOKIE,
      },
    }
  );

  const data = response.data;

  const profile_pic = data?.graphql?.user?.profile_pic_url_hd;
  const full_name = data?.graphql?.user?.full_name;
  const bio = data?.graphql?.user?.biography;
  const followers = data?.graphql?.user?.edge_followed_by.count;
  const following = data?.graphql?.user?.edge_follow.count;

  return {
    profile_pic,
    full_name,
    bio,
    followers,
    following,
  };
};
