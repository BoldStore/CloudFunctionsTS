import { NextFunction, Request, Response } from "express";
import { auth, firestore } from "firebase-admin";
import ExpressError = require("../utils/ExpressError");

export const getProfile: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authData = req.user;
    const id = authData.uid;

    const user = await firestore().collection("users").doc(id).get();
    const store = await firestore().collection("stores").doc(id).get();

    if (user?.exists) {
      let name = false;
      let phone = false;
      const address = (
        await firestore()
          .collection("addresses")
          .where("user", "==", id)
          .limit(1)
          .get()
      ).docs[0];

      if (user.data()?.name) {
        name = true;
      }

      if (user.data()?.phone) {
        phone = true;
      }

      const percentage: number = getPercentage([name, phone, address?.exists]);

      res.status(200).json({
        success: true,
        data: user.data(),
        isStore: false,
        percentage,
        address: address?.exists
          ? { ...address?.data(), id: address?.id }
          : null,
        name,
        phone,
      });
      return;
    }

    if (store?.exists) {
      let data = false;
      const address = (
        await firestore()
          .collection("addresses")
          .where("user", "==", id)
          .limit(1)
          .get()
      ).docs[0];
      const paymentDetails = await firestore()
        .collection("paymentDetails")
        .doc(id)
        .get();

      if (store?.data()?.username) {
        data = true;
      }

      //   Get percentage
      const percentage: number = getPercentage([
        data,
        address?.exists,
        paymentDetails?.exists,
      ]);

      res.status(200).json({
        success: true,
        data: store?.data(),
        isStore: true,
        address: address?.exists
          ? { ...address?.data(), id: address?.id }
          : null,
        paymentDetails: paymentDetails?.data(),
        percentage,
      });
      return;
    }

    next(new ExpressError("User not found", 404));
  } catch (e) {
    console.log("Error in getting profile: ", e);
    next(new ExpressError("Cannot get profile", 500, e));
  }
};

const getPercentage: (values: Array<boolean>) => number = (
  values: Array<boolean>
) => {
  const val = values.reduce((acc: number, curr: boolean) => {
    if (curr) {
      return acc + 1;
    }
    return acc;
  }, 0);
  return (val / values.length) * 100;
};

export const linkUser: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (req, res, next) => {
  try {
    const user = req.user;
    // UserID
    const uid = req.query.userId;

    // Anonymous ID
    const userId = user.uid;

    if (user.provider_id != "anonymous") {
      next(new ExpressError("User is not anonymous", 400));
      return;
    }

    // Find addresses
    const addresses = await firestore()
      .collection("addresses")
      .where("user", "==", userId)
      .get();

    // Change the user
    for (let i = 0; i < addresses?.docs?.length; i++) {
      const address = addresses?.docs[i];
      await firestore().collection("addresses").doc(address.id).update({
        user: uid,
      });
    }

    // Find Saved
    const saved = await firestore()
      .collection("saved")
      .where("user", "==", userId)
      .get();

    // Change the user
    for (let i = 0; i < saved?.docs?.length; i++) {
      const saveDoc = saved?.docs[i];
      await firestore().collection("saved").doc(saveDoc.id).update({
        user: uid,
      });
    }

    // Find orders
    const orders = await firestore()
      .collection("orders")
      .where("user", "==", userId)
      .get();

    // Change the user
    for (let i = 0; i < orders?.docs?.length; i++) {
      const order = orders?.docs[i];
      await firestore().collection("orders").doc(order.id).update({
        user: uid,
      });
    }

    // Delete anonymous user
    await auth().deleteUser(userId);

    res.status(200).json({
      success: true,
      message: "Link Successful",
    });
  } catch (e) {
    console.log("Error in linking user: ", e);
    next(new ExpressError("Cannot link user", 500, e));
  }
};
