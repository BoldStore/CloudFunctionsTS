import axios from "axios";
import { INSTAGRAM_ACCESS_TOKEN } from "../constants";

export const getAccessToken = async () => {
  let access_token = "";
  let user_id = "";
  const response = await axios.post(INSTAGRAM_ACCESS_TOKEN, {
    client_id: "",
    client_secret: "",
    code: "",
    grant_type: "authorization_code",
    redirect_uri: "",
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
