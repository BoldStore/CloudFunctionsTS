import axios from "axios";
import { firestore } from "firebase-admin";
// import { INSTA_COOKIE } from "../secrets";

export const getInstaData = async (username: string) => {
  console.log("WOHOOOOOOO");

  const configs = await firestore().collection("config").get();

  const insta_cookie = configs.docs[0].data().insta_cookie;

  console.log("INSTA_COOKIE", insta_cookie);

  console.log("DATA>>>", configs.docs[0].data());
  const cookie = insta_cookie?.toString();
  console.log("COOKIE>>>", cookie);

  const instance = axios.create({
    timeout: 15000,
    baseURL: `https://www.instagram.com/${username}/?__a=1`,
    headers: {
      cookie: cookie,
    },
  });

  instance.interceptors.response.use(
    (response) => {
      const originalRequest = response.config;
      console.log("RESPONSE", originalRequest);
      console.log("Status>", response.status);
      console.log("Data>", response.data);
      if (response.data.graphql?.user?.full_name) {
        // Exists and worked
        return response;
      } else {
        // Retry
        loginInsta();
        return instance(originalRequest);
      }
    },
    // eslint-disable-next-line space-before-function-paren
    async function (error) {
      console.log(error);

      console.log("CONFIG>>", error.config);
    }
  );

  const response = await instance.get("/");
  // console.log("RESPONSE>>", res);
  // console.log("Data>", res.data.graphql?.user?.full_name);

  // const response = await axios.get(
  //   `https://www.instagram.com/${username}/?__a=1`,
  //   {
  //     headers: {
  //       "User-Agent":
  //         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36",
  //       Accept: "*/*",
  //       "Accept-Language": "en-US,en;q=0.9",
  //       "X-Requested-With": "XMLHttpRequest",
  //       Connection: "keep-alive",
  //       cookie: insta_cookie.toString(),
  //     },
  //   }
  // );

  const data = response.data;

  console.log("Data>>>", data);

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

const loginInsta = async () => {
  // get email password
};
