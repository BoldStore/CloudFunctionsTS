import { https, Request, Response } from "firebase-functions/v1";
import { firestore } from "firebase-admin";
// import { refresh_store_data } from "./helper/store";
import { checkAuth } from "./helper/check_auth";
import { getAccessToken } from "./helper/get_access_token";
import { getStoreData } from "./helper/get_store_data";

import cors = require("cors");

exports.createStore = https.onRequest(
  async (req: Request, res: Response<any>) => {
    try {
      const inviteCode = req.body.inviteCode;

      if (!inviteCode) {
        res.status(400).send({
          success: false,
          message: "Invite code is required",
        });
        return;
      }

      console.log("CODE>>>>>", inviteCode);

      const authUser = await checkAuth(req, res);
      const id = authUser!.userId!;
      const email = authUser!.email;

      const code = (
        await firestore()
          .collection("codes")
          .where("code", "==", inviteCode)
          .get()
      ).docs[0];
      if (!code.exists || !code.data()!.isActive) {
        res.status(400).send({
          success: false,
          message: "Invite code is not valid",
        });
      }

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

      // Set code to used
      await firestore().collection("codes").doc(code.id).update({
        isActive: false,
        store: id,
      });

      await firestore().collection("stores").doc(id).set({
        email,
      });

      res.status(201).json({
        success: true,
      });
    } catch (e) {
      console.log("Error in creating store", e);
      res.status(500).json({
        success: false,
        message: "Error in creating store",
        error: e,
      });
    }
  }
);

exports.saveStoreData = https.onRequest(
  async (req: Request, res: Response<any>) => {
    try {
      const id = (await checkAuth(req, res))!.userId!;
      const insta_code = req.body.code;

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

      // TODO: Get long lived access token

      // Get store data
      const data = (
        await getStoreData(auth_data.user_id, auth_data.access_token, store.id)
      ).store;

      // Save to db
      await firestore().collection("stores").doc(id).set(data, { merge: true });

      res.status(200).json({
        success: true,
        store: data,
      });
    } catch (e) {
      console.log("Error in saving store data", e);
      res.status(400).json({
        success: false,
        message: "Could not store save store data",
        error: e,
      });
    }
  }
);

exports.updateStoreProducts = https.onRequest(
  async (req: Request, res: Response<any>) => {
    try {
      const id = (await checkAuth(req, res))!.userId!;

      const store = await firestore().collection("stores").doc(id).get();

      if (!store.exists) {
        res.status(400).json({
          success: false,
          message: "Store does not exist",
        });
        return;
      }

      // const success = await getStoreMedia(
      //   store.data()!.user_id,
      //   store.data()!.access_token,
      //   store.id
      // );

      res.status(200).json({
        success: true,
      });
    } catch (e) {
      console.log("Error in updating store products", e);
      res.status(400).json({
        success: false,
        message: "Could not update store products",
        error: e,
      });
    }
  }
);

exports.updateStore = https.onRequest(
  async (req: Request, res: Response<any>) => {
    try {
      const id = (await checkAuth(req, res))!.userId!;

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

      // if (upi_id) {
      // Payment Details
      await firestore().collection("paymentDetails").doc(id).set(
        {
          upi_id,
          phone: phone_number,
        },
        { merge: true }
      );
      // }

      if (phone_number) {
        // refresh_store_data(id, phone_number);
      }

      res.status(200).json({
        success: true,
      });
    } catch (e) {
      console.log("Error in updating store", e);
      res.status(400).json({
        success: false,
        message: "Could not update store",
        error: e,
      });
    }
  }
);

exports.addPotentialStore = https.onRequest(
  async (req: Request, res: Response<any>) => {
    cors({
      origin: true,
    })(req, res, async () => {
      try {
        const insta_username = req.body.insta_username;
        const email = req.body.email;

        if (!insta_username) {
          res.status(400).json({
            success: false,
            message: "Insta username is required",
          });
          return;
        }

        if (!email) {
          res.status(400).json({
            success: false,
            message: "Email is required",
          });
          return;
        }

        const insta_stores = (
          await firestore()
            .collection("potentialStores")
            .where("insta_username", "==", insta_username)
            .get()
        ).docs;
        const email_stores = (
          await firestore()
            .collection("potentialStores")
            .where("email", "==", email)
            .get()
        ).docs;

        if (insta_stores.length > 0) {
          res.status(400).json({
            success: false,
            message: "Insta username already exists",
          });
          return;
        }

        if (email_stores.length > 0) {
          res.status(400).json({
            success: false,
            message: "Email already exists",
          });
          return;
        }

        // Save data
        await firestore().collection("potentialStores").add({
          insta_username,
          email,
        });

        res.status(200).json({
          success: true,
          message: "Your data has been saved",
        });
      } catch (e) {
        console.log("Error in saving data", e);
        res.status(400).json({
          success: false,
          message: "There was an error saving data",
          error: e,
        });
      }
    });
  }
);
