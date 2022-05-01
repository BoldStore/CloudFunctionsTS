import { https, Request, Response } from "firebase-functions/v1";
import { firestore } from "firebase-admin";
import { refresh_store_data } from "./helper/store";
import { checkAuth } from "./helper/check_auth";
import { getAccessToken } from "./helper/get_access_token";
import { getStoreData } from "./helper/get_store_data";

exports.createStore = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const id = (await checkAuth(req, res))!;
    const email = req.body.email;

    const user = await firestore().collection("users").doc(id).get();
    const store = await firestore().collection("stores").doc(id).get();

    if (user.exists) {
      res.status(400).json({
        success: false,
        message: "User already exists",
      });
      return;
    }

    if (store.exists) {
      res.status(400).json({
        success: false,
        message: "Store already exists",
      });
      return;
    }

    await firestore().collection("stores").doc(id).set({
      email,
    });

    res.status(201).json({
      success: true,
    });
  }
);

exports.saveStoreData = https.onRequest(
  async (req: Request, res: Response<any>) => {
    try {
      const id = (await checkAuth(req, res))!;
      const insta_code = req.body.code;

      console.log("CODE>>>>>", insta_code);
      console.log("ID>>>>>", id);

      const store = await firestore().collection("stores").doc(id).get();

      if (!store.exists) {
        res.status(400).json({
          success: false,
          message: "Store does not exist",
        });
        return;
      }

      // Get Insta access Token
      const auth_data = await getAccessToken(insta_code);

      console.log("AUTH DATA>>>>", auth_data);

      // TODO: Get long lived access token

      // Get store data
      const data = (
        await getStoreData(auth_data.user_id, auth_data.access_token, store.id)
      ).store;

      console.log("DATA WOHO", data);

      // Save to db
      await firestore().collection("stores").doc(id).set(data, { merge: true });

      res.status(200).json({
        success: true,
        store: data,
      });
    } catch (e) {
      console.log(e);
      res.status(400).json({
        success: false,
        message: "There was an error: " + e,
      });
    }
  }
);

exports.updateStore = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const id = (await checkAuth(req, res))!;

    const user = await firestore().collection("users").doc(id).get();

    if (user.exists) {
      res.status(400).json({
        success: false,
        message: "User already exists",
      });
      return;
    }

    const upi_id = req.body.upi_id;
    const phone_number = req.body.phone_number;

    if (upi_id) {
      // Payment Details
      await firestore().collection("paymentDetails").doc(id).set(
        {
          upi_id,
        },
        { merge: true }
      );
    }

    if (phone_number) {
      refresh_store_data(id, phone_number);
    }

    res.status(200).json({
      success: true,
    });
  }
);
