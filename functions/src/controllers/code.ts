import { NextFunction, Request, Response } from "express";
import { firestore } from "firebase-admin";
import { generateCode } from "../helper/code";
import { Code, CodeType } from "../models/code";
import ExpressError = require("../utils/ExpressError");

export const addInviteToken: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const userId = req.user.uid;

    // const store = await firestore().collection("stores").doc(userId).get();

    // if (!store.exists) {
    //   res.status(404).json({
    //     success: false,
    //     message: "Store not found",
    //   });
    //   return;
    // }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // const tokensByStore = await firestore()
    //   .collection("inviteTokens")
    //   .where("storeId", "==", userId)
    //   .where("createdAt", "<=", today)
    //   .where("createdAt", ">=", yesterday)
    //   .get();

    // if (tokensByStore.docs.length >= 3) {
    //   res.status(400).json({
    //     success: false,
    //     message: "You have already generated 3 invite tokens today",
    //   });
    //   return;
    // }

    const inviteCode = await generateCode();

    const code: CodeType = new Code(inviteCode, "userId", new Date(), true);

    // Add to db
    await firestore().collection("codes").add(code);

    res.status(201).json({
      success: true,
      code,
    });
  } catch (e) {
    next(new ExpressError("Error adding invite token", 500, e));
  }
};
