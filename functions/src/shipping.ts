import { https, Request, Response } from "firebase-functions/v1";
import axios from "axios";
import { SHIPROCKET_ADDRESSES, SHIPROCKET_LOGIN } from "./constants";
import {
  SHIPROCKET_ACCESS_TOKEN,
  SHIPROCKET_EMAIL,
  SHIPROCKET_PASSWORD,
} from "./secrets";

exports.getShiprocketAccessToken = https.onRequest(
  async (req: Request, res: Response<any>) => {
    try {
      const email = SHIPROCKET_EMAIL;
      const password = SHIPROCKET_PASSWORD;

      // TODO: Save to DB

      const response = await axios.post(SHIPROCKET_LOGIN, {
        email: email,
        password: password,
      });

      const access_token = response.data.token;

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
      const access_token = SHIPROCKET_ACCESS_TOKEN;
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
