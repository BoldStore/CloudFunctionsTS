import { https, Request, Response } from "firebase-functions/v1";
import { firestore, auth } from "firebase-admin";
import { refresh_store_data } from "./helper/store";

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

    const insta_username = req.body.insta_username;
    const upi_id = req.body.upi_id;
    const phone_number = req.body.phone_number;

    // Payment Details
    await firestore().collection("paymentDetails").doc(id).set(
      {
        upi_id,
      },
      { merge: true }
    );

    // Store Details
    await firestore().collection("stores").doc(id).set(
      {
        insta_username,
        phone_number,
      },
      { merge: true }
    );

    refresh_store_data(id, insta_username);

    res.status(200).json({
      success: true,
    });
  }
);
