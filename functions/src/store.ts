import { https, Request, Response } from "firebase-functions/v1";
import { firestore, auth } from "firebase-admin";
import { refresh_store_data } from "./helper/store";

exports.createStore = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const token = req.headers.authorization!;
    const id: string = (await auth().verifyIdToken(token)).uid;
    const email = req.body.email;

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
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

    await firestore().collection("stores").doc(id).set({
      email,
    });
  }
);

exports.updateStore = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const token = req.headers.authorization!;
    const id: string = (await auth().verifyIdToken(token)).uid;

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

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
