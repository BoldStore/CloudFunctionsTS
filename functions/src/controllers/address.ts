import { NextFunction, Request, Response } from "express";
import { firestore } from "firebase-admin";
import { addPickup } from "../helper/shipping";
import ExpressError = require("../utils/ExpressError");
import Address, { AddressType } from "../models/Address";

export const addAddress: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.uid;

    const store = await firestore().collection("stores").doc(userId).get();

    const title = req.body.title;
    const address_string = req.body.address;
    const addressL1 = req.body.addressL1;
    const addressL2 = req.body.addressL2;
    const city = req.body.city;
    const state = req.body.state;
    const pincode = req.body.pincode;
    const notes = req.body.notes;

    const address_model: AddressType = new Address(
      null,
      address_string,
      title,
      addressL1,
      addressL2,
      city,
      state,
      pincode,
      userId,
      notes
    );

    const addressFromDb = (
      await firestore()
        .collection("addresses")
        .where("userId", "==", userId)
        .get()
    ).docs[0];

    if (addressFromDb?.exists) {
      next(new ExpressError("Address already exists", 400));
      return;
    }

    const address = await firestore()
      .collection("addresses")
      .add(address_model);

    address_model.id = address.id;

    if (store?.exists) {
      await addPickup(
        title,
        store.data()?.email,
        store.data()?.phone,
        address_model,
        store.id
      );

      // Check if completed
      const paymentDetails = await firestore()
        .collection("paymentDetails")
        .doc(store.id)
        .get();

      if (paymentDetails?.exists) {
        await firestore().collection("stores").doc(store.id).set(
          {
            isCompleted: true,
          },
          { merge: true }
        );
      }
    }

    res.status(201).json({
      success: true,
      address: address_model,
    });
  } catch (e) {
    next(new ExpressError("Could not add address", 500, e));
  }
};

export const getUserAddresses: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.uid;

    const addresses = await firestore()
      .collection("addresses")
      .where("userId", "==", userId)
      .get();

    res.status(200).json({
      success: true,
      addresses: addresses.docs.map((address) => ({
        id: address.id,
        ...address.data(),
      })),
    });
  } catch (e) {
    next(new ExpressError("Could not get user addresses", 500, e));
  }
};

export const updateAddress: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id: string = req.body.id?.toString();
    const userId = req.user.uid;

    const title = req.body.title;
    const address_string = req.body.address;
    const addressL1 = req.body.addressL1;
    const addressL2 = req.body.addressL2;
    const city = req.body.city;
    const state = req.body.state;
    const pincode = req.body.pincode;
    const notes = req.body.notes;

    const address_model = new Address(
      null,
      address_string,
      title,
      addressL1,
      addressL2,
      city,
      state,
      pincode,
      userId,
      notes
    );

    const address = await firestore().collection("addresses").doc(id).get();

    if (!address.exists) {
      next(new ExpressError("Address does not exist", 400));
      return;
    }

    if (address.data()?.userId !== userId) {
      next(new ExpressError("Address does not belong to user", 401));
      return;
    }

    await firestore()
      .collection("addresses")
      .doc(id)
      .set(address_model, { merge: true });

    res.status(200).json({
      success: true,
      address: address_model,
    });
  } catch (e) {
    next(new ExpressError("Could not update address", 500, e));
  }
};

export const deleteAddress: (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id: string = req.body.id?.toString();
    const userId = req.user.uid;

    const address = await firestore().collection("addresses").doc(id).get();

    if (!address.exists) {
      next(new ExpressError("Address does not exist", 400));
      return;
    }

    if (address.data()?.userId !== userId) {
      next(new ExpressError("Address does not belong to user", 401));
      return;
    }

    await firestore().collection("addresses").doc(id).delete();

    res.status(200).json({
      success: true,
    });
  } catch (e) {
    console.log("Delete address error: ", e);
    next(new ExpressError("Could not delete address", 500, e));
  }
};
