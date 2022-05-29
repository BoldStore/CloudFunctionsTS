import { NextFunction, Request, Response } from "express";
import { firestore } from "firebase-admin";
import {
  getAccessToken,
  getLongLivedAccessToken,
} from "../helper/get_access_token";
import { getStoreData } from "../helper/get_store_data";
import { APP_NAME, transporter } from "../helper/mails";
import { refresh_store_products } from "../helper/store";
import { AVI_MAIL, BOLD_MAIL, JAYESH_MAIL } from "../secrets";
import ExpressError = require("../utils/ExpressError");

export const createStore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const inviteCode = req.body.inviteCode;

    if (!inviteCode) {
      next(new ExpressError("Invite code is required", 400));
      return;
    }

    const authUser = req.user;
    const id = authUser.uid;
    const email = authUser.email;

    const code = (
      await firestore()
        .collection("codes")
        .where("code", "==", inviteCode)
        .get()
    ).docs[0];
    if (!code.exists || !code.data()!.isActive) {
      next(new ExpressError("Invite code is not valid", 400));
    }

    const user = await firestore().collection("users").doc(id).get();
    const store = await firestore().collection("stores").doc(id).get();

    if (user.exists) {
      next(new ExpressError("User already exists", 400));
      return;
    }

    if (store.exists) {
      next(new ExpressError("Store already exists", 400));
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
    next(new ExpressError("Could not create store", 500, e));
  }
};

export const saveStoreData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.user.uid;
    const insta_code = req.body.code;

    const store = await firestore().collection("stores").doc(id).get();

    if (!store.exists) {
      next(new ExpressError("Store does not exist", 401));
      return;
    }

    if (!insta_code) {
      next(new ExpressError("Instagram code is required", 400));
      return;
    }

    // Get Insta access Token
    const auth_data = await getAccessToken(insta_code);

    const access_token_data = await getLongLivedAccessToken(
      auth_data.access_token
    );

    let data = {};

    if (access_token_data.error) {
      // Get store data
      data = (
        await getStoreData(auth_data.user_id, auth_data.access_token, store.id)
      ).store;
    } else {
      data = (
        await getStoreData(
          auth_data.user_id,
          access_token_data.access_token,
          store.id,
          access_token_data.expires_in
        )
      ).store;
    }

    // Save to db
    await firestore().collection("stores").doc(id).set(data, { merge: true });

    res.status(200).json({
      success: true,
      store: data,
    });
  } catch (e) {
    console.log("Error in saving store data", e);
    next(new ExpressError("Could not store save store data", 500, e));
  }
};

export const updateStoreProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.user.uid;

    const store = await firestore().collection("stores").doc(id).get();

    if (!store.exists) {
      next(new ExpressError("Store does not exist", 400));
      return;
    }

    const data = await refresh_store_products(store.id, store.data());

    res.status(200).json({
      data,
    });
  } catch (e) {
    console.log("Error in updating store products", e);
    next(new ExpressError("Could not update store products", 500, e));
  }
};

export const updateStore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.user.uid;

    const user = await firestore().collection("users").doc(id).get();

    if (user.exists) {
      next(new ExpressError("User already exists", 400));
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
    next(new ExpressError("Could not update store", 500, e));
  }
};

export const addPotentialStore = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const insta_username = req.body.insta_username;
    const email = req.body.email;

    if (!insta_username) {
      next(new ExpressError("Insta username is required", 400));
      return;
    }

    if (!email) {
      next(new ExpressError("Email is required", 400));
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
      next(new ExpressError("Insta username already exists", 400));
      return;
    }

    if (email_stores.length > 0) {
      next(new ExpressError("Email already exists", 400));
      return;
    }

    // Save data
    await firestore().collection("potentialStores").add({
      insta_username,
      email,
    });

    const emails = `${JAYESH_MAIL}, ${AVI_MAIL}, ${BOLD_MAIL}`;

    // Send mail to founders
    const mailOptions = {
      from: `${APP_NAME} <noreply@boldstore.com>`,
      to: emails,
      subject: "Boldstore - Potential Store",
      html: `
          <h1>Boldstore - Potential Store</h1>
          <p>
          Someone just submitted a potential store.
          </p>
          <p>
          Insta username: ${insta_username}
          <br>Email: ${email}
          </p>
          `,
      text: `
          BoldStore - Potential Store
          Someone just submitted a potential store.
          Insta username: ${insta_username}
          Email: ${email}
          `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Your data has been saved",
    });
  } catch (e) {
    console.log("Error in saving data", e);
    next(new ExpressError("Could not save data", 500, e));
  }
};
