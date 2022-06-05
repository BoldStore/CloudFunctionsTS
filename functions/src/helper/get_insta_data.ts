import axios from "axios";
import { firestore } from "firebase-admin";
import { InstaData } from "../interfaces/insta_data";
// import { INSTAGRAM_LOGIN } from "../constants";

export const getInstaData: (username: string) => Promise<InstaData> = async (
  username: string
) => {
  const configs = await firestore().collection("config").get();

  const configData = configs.docs[0].data();

  // const insta_cookie = configData.insta_cookie;
  const ig_app_id = configData.ig_app_id;

  // const insta_username = configData.username;
  // const enc_password = configData.enc_password;

  let profile_pic = "";
  let full_name = "";
  let bio = "";
  let followers = "";
  let following = "";

  try {
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
          // cookie: insta_cookie.toString(),
          "X-IG-App-ID": ig_app_id,
        },
      }
    );

    const data = response.data;

    // await loginInsta(insta_username, enc_password);

    // console.log("Data>>", data);

    profile_pic = data?.user?.profile_pic_url_hd;
    full_name = data?.user?.full_name;
    bio = data?.user?.biography;
    followers = data?.user?.edge_followed_by.count;
    following = data?.user?.edge_follow.count;
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.log((e as any).response.data);
  }

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
