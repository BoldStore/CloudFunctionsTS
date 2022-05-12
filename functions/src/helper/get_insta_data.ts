import axios from "axios";
import { firestore } from "firebase-admin";
// import { INSTAGRAM_LOGIN } from "../constants";
// import { INSTA_COOKIE } from "../secrets";

export const getInstaData = async (username: string) => {
  const configs = await firestore().collection("config").get();

  const configData = configs.docs[0].data();

  const insta_cookie = configData.insta_cookie;

  // const insta_username = configData.username;
  // const enc_password = configData.enc_password;

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
        cookie: insta_cookie.toString(),
      },
    }
  );

  const data = response.data;

  // await loginInsta(insta_username, enc_password);

  // console.log("Data>>", data);

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

// const loginInsta = async (username: string, enc_password: string) => {
//   const response = await axios.post(
//     INSTAGRAM_LOGIN,
//     {
//       username,
//       enc_password,
//     },
//     {
//       headers: {
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
//         "Content-Type": "application/x-www-form-urlencoded",
//         Accept: "*/*",
//       },
//     }
//   );

//   console.log(response.status);
// };
