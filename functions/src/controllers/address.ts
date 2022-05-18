import { NextFunction, Request, Response } from "express";
import { firestore } from "firebase-admin";
import { addPickup } from "../helper/shipping";
import ExpressError = require("../utils/ExpressError");

export const addAddress = async (
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

    // const address_model = new Address(
    //   address_string,
    //   title,
    //   addressL1,
    //   addressL2,
    //   city,
    //   state,
    //   pincode,
    //   userId,
    //   notes
    // );

    const address = await firestore().collection("addresses").add({
      address_string,
      title,
      addressL1,
      addressL2,
      city,
      state,
      pincode,
      userId,
      notes,
    });

    if (store.exists) {
      await addPickup(
        title,
        store.data()!.email,
        store.data()!.phone,
        {
          address: address_string,
          title,
          addressL1,
          addressL2,
          city,
          state,
          pincode,
          user: userId,
          notes,
        },
        store.id
      );
    }

    res.status(201).json({
      success: true,
      address: {
        address_string,
        title,
        addressL1,
        addressL2,
        city,
        state,
        pincode,
        userId,
        notes,
        id: address.id,
      },
    });
  } catch (e) {
    console.log("Add address error: ", e);
    next(new ExpressError("Could not add address", 500, e));
  }
};
