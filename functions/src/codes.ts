import { auth, firestore } from "firebase-admin";
import { https, Request, Response } from "firebase-functions/v1";
import { generateCode } from "./helper/code";

exports.addInviteToken = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const token = req.headers.authorization!;
    const userId: string = (await auth().verifyIdToken(token)).uid;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const store = await firestore().collection("stores").doc(userId).get();

    if (!store.exists) {
      res.status(404).json({
        success: false,
        message: "Store not found",
      });
      return;
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const tokensByStore = await firestore()
      .collection("inviteTokens")
      .where("storeId", "==", userId)
      .where("createdAt", "<=", today)
      .where("createdAt", ">=", yesterday)
      .get();

    if (tokensByStore.docs.length >= 3) {
      res.status(400).json({
        success: false,
        message: "You have already generated 3 invite tokens today",
      });
      return;
    }

    const inviteCode = await generateCode();

    const code = new Code(inviteCode, userId, new Date(), true);

    // Add to db
    await firestore().collection("codes").add(code);

    res.status(201).json({
      success: true,
      code,
    });
  }
);
