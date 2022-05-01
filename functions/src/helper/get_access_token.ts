import axios from "axios";
import { INSTAGRAM_ACCESS_TOKEN } from "../constants";
import { INSTA_APP_ID, INSTA_CLIENT_SECRET } from "../secrets";

export const getAccessToken = async (code?: string) => {
  let access_token = "";
  let user_id = "";
  const response = await axios.post(INSTAGRAM_ACCESS_TOKEN, {
    client_id: INSTA_APP_ID,
    client_secret: INSTA_CLIENT_SECRET,
    code: code,
    grant_type: "authorization_code",
    redirect_uri: "https://boldstore.in/instagram/callback",
  });

  if (response.status === 200) {
    access_token = response.data.access_token;
    user_id = response.data.user_id;
  }

  return {
    access_token,
    user_id,
  };
};
