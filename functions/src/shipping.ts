import { https, Request, Response } from "firebase-functions/v1";
import axios from "axios";
import { NEW_PICKUP, SHIPROCKET_LOGIN } from "./constants";

exports.getShiprocketAccessToken = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    const response = await axios.post(SHIPROCKET_LOGIN, {
      email: email,
      password: password,
    });

    const access_token = response.data.token;

    res.status(200).json({
      success: true,
      access_token,
    });
  }
);

exports.getShiprocketAddresses = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const access_token = process.env.SHIPROCKET_ACCESS_TOKEN;
    const response = await axios.get(NEW_PICKUP, {
      headers: {
        Authorization: "Bearer " + access_token,
      },
    });

    res.status(200).json({
      success: true,
      addresses: response.data.shipping_addresses,
    });
  }
);
