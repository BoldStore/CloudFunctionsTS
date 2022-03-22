import axios from "axios";

export const getAccessToken = async (code: string) => {
  var access_token: string = "";
  var user_id: string = "";
  const response = await axios.post(
    "https://api.instagram.com/oauth/access_token",
    {
      client_id: "",
      client_secret: "",
      code: "",
      grant_type: "authorization_code",
      redirect_uri: "",
    }
  );

  if (response.status === 200) {
    access_token = response.data.access_token;
    user_id = response.data.user_id;
  }

  return {
    access_token,
    user_id,
  };
};
