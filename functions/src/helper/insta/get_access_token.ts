/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { INSTAGRAM_ACCESS_TOKEN } from "../../constants";
import { stringify } from "qs";
import { firestore } from "firebase-admin";

interface getAccessTokenResponse {
  access_token: string;
  user_id: string;
  user_id_orignal: string;
  error: any;
}

interface getLongAccessTokenResponse {
  access_token: string;
  expires_in: number | undefined;
  error: any;
}

export const getAccessToken: (
  code: string
) => Promise<getAccessTokenResponse> = async (code?: string) => {
  let access_token = "";
  let user_id = "";
  let user_id_orignal = "";
  let error = null;

  const config = (await firestore().collection("config").get())?.docs[0];

  const data = stringify({
    client_id: config?.data().insta_app_id,
    client_secret: config?.data().insta_client_secret,
    code: code,
    grant_type: "authorization_code",
    redirect_uri: config?.data().redirect_uri,
  });

  try {
    const response = await axios.post(INSTAGRAM_ACCESS_TOKEN, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    access_token = response?.data?.access_token;

    const user_id_res = response?.data?.user_id.toString();
    user_id_orignal = response?.data?.user_id.toString();
    user_id = user_id?.concat(
      user_id_res?.slice(0, -1),
      (parseInt(user_id_res?.slice(-1)) + 1).toString()
    );
  } catch (e) {
    console.log("Error in getting access token", (e as any)?.response?.data);
    error = (e as any)?.response?.data ?? e;
  }

  return {
    access_token,
    user_id,
    user_id_orignal,
    error,
  };
};

export const getLongLivedAccessToken: (
  access_token: string
) => Promise<getLongAccessTokenResponse> = async (access_token: string) => {
  const config = (await firestore().collection("config").get())?.docs[0];

  const url = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${
    config?.data()?.insta_client_secret
  }&access_token=${access_token}`;
  let long_access_token = null;
  let error = null;
  let expires_in = null;

  try {
    const response = await axios.get(url);

    if (response.status == 200) {
      long_access_token = response?.data?.access_token;
      expires_in = response?.data?.expires_in;
    }
  } catch (e) {
    console.log("Long Lived token error>>", (e as any)?.response?.data);
    error = (e as any)?.response?.data ?? e;
  }

  return {
    access_token: long_access_token,
    expires_in: expires_in,
    error,
  };
};

export const refreshToken: (
  access_token: string
) => Promise<getLongAccessTokenResponse> = async (access_token: string) => {
  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${access_token}`;
  let long_access_token = null;
  let error = null;
  let expires_in = null;

  try {
    const response = await axios.get(url);

    if (response.status == 200) {
      long_access_token = response.data.access_token;
      expires_in = response.data.expires_in;
    }
  } catch (e) {
    console.log("Long Lived token error>>", (e as any).response.data());
    error = (e as any).response.data();
  }

  return {
    access_token: long_access_token,
    expires_in: expires_in,
    error,
  };
};
