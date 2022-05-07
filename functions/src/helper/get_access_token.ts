import axios from "axios";
import { INSTAGRAM_ACCESS_TOKEN } from "../constants";
import { INSTA_APP_ID, INSTA_CLIENT_SECRET } from "../secrets";
import { stringify } from "qs";

export const getAccessToken = async (code?: string) => {
  let access_token = "";
  let user_id = "";

  const data = stringify({
    client_id: INSTA_APP_ID,
    client_secret: INSTA_CLIENT_SECRET,
    code: code,
    grant_type: "authorization_code",
    redirect_uri: "https://bold-96a92.firebaseapp.com/__/auth/handler",
  });

  const response = await axios.post(INSTAGRAM_ACCESS_TOKEN, data, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  if (response.status === 200) {
    access_token = response.data.access_token;

    const user_id_res = response.data.user_id.toString();
    user_id = user_id.concat(
      user_id_res.slice(0, -1),
      (parseInt(user_id_res.slice(-1)) + 1).toString()
    );
  }

  console.log("USERIDDD", user_id);

  return {
    access_token,
    user_id,
  };
};
