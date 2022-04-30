import { https, Request, Response } from "firebase-functions/v1";
import { firestore as firestoredb } from "firebase-admin";
import { checkAuth } from "./helper/check_auth";

exports.addAddress = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const userId = (await checkAuth(req, res))!;

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

    const address = await firestoredb().collection("addresses").add({
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
  }
);

exports.getUserAddresses = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const userId = (await checkAuth(req, res))!;

    const addresses = await firestoredb()
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
  }
);

exports.updateAddress = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const id: string = req.body.id!.toString();
    const userId = (await checkAuth(req, res))!;

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

    await firestoredb().collection("addresses").doc(id).set(
      {
        address_string,
        title,
        addressL1,
        addressL2,
        city,
        state,
        pincode,
        userId,
        notes,
      },
      { merge: true }
    );

    const addresses = await firestoredb()
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
  }
);

exports.deleteAddress = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const id: string = req.body.id!.toString();
    const userId = (await checkAuth(req, res))!;

    await firestoredb().collection("addresses").doc(id).delete();

    const addresses = await firestoredb()
      .collection("addresses")
      .where("user", "==", userId)
      .get();

    res.status(200).json({
      success: true,
      addresses: addresses.docs.map((address) => ({
        id: address.id,
        ...address.data(),
      })),
    });
  }
);
