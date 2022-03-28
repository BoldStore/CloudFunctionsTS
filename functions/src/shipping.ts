import { https, Request, Response } from "firebase-functions/v1";
import axios from "axios";
import { SHIPROCKET_LOGIN } from "./constants";

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
