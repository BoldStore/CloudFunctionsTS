import { https, Request, Response } from "firebase-functions/v1";
import axios from "axios";
import { SHIPROCKET_ADDRESSES, SHIPROCKET_LOGIN } from "./constants";
import { firestore } from "firebase-admin";

exports.getShiprocketAccessToken = https.onRequest(
  async (req: Request, res: Response<any>) => {
    try {
      const config = (await firestore().collection("config").get()).docs[0];

      const email = config.data().shiprocket_email;
      const password = config.data().shiprocket_password;

      const response = await axios.post(SHIPROCKET_LOGIN, {
        email: email,
        password: password,
      });

      const access_token = response.data.token;

      await firestore().collection("config").doc(config.id).update({
        shiprocket_access_token: access_token,
      });

      res.status(200).json({
        success: true,
        access_token,
      });
    } catch (e) {
      console.log("There was an error geting shiprocket token", e);
      res.status(500).json({
        success: false,
        message: "Could not get shiprocket token",
        error: e,
      });
    }
  }
);

exports.getShiprocketAddresses = https.onRequest(
  async (req: Request, res: Response<any>) => {
    try {
      const config = (await firestore().collection("config").get()).docs[0];
      const access_token = config.data().shiprocket_access_token;
      const response = await axios.get(SHIPROCKET_ADDRESSES, {
        headers: {
          Authorization: "Bearer " + access_token,
        },
      });

      res.status(200).json({
        success: true,
        addresses: response.data.shipping_addresses,
      });
    } catch (e) {
      console.log("Shiprocket addresses error", e);
      res.status(500).json({
        success: false,
        message: "Could not get shiprocket addresses",
        error: e,
      });
    }
  }
);
