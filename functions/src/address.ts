import { https, Request, Response } from "firebase-functions/v1";
import { firestore as firestoredb, auth } from "firebase-admin";

exports.addAddress = https.onRequest(
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

    const title = req.body.title;
    const address_string = req.body.address;
    const addressL1 = req.body.addressL1;
    const addressL2 = req.body.addressL2;
    const city = req.body.city;
    const state = req.body.state;
    const pincode = req.body.pincode;
    const notes = req.body.notes;

    const address_model = new Address(
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

    const address = await firestoredb()
      .collection("addresses")
      .add(address_model);

    res.status(201).json({
      success: true,
      address,
    });
  }
);

exports.getUserAddresses = https.onRequest(
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

    const addresses = await firestoredb()
      .collection("addresses")
      .where("user", "==", userId)
      .get();

    res.status(200).json({
      success: true,
      addresses,
    });
  }
);

exports.updateAddress = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const id: string = req.query.id!.toString();
    const token = req.headers.authorization!;
    const userId: string = (await auth().verifyIdToken(token)).uid;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const title = req.body.title;
    const address_string = req.body.address;
    const addressL1 = req.body.addressL1;
    const addressL2 = req.body.addressL2;
    const city = req.body.city;
    const state = req.body.state;
    const pincode = req.body.pincode;
    const notes = req.body.notes;

    const address_model = new Address(
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

    const address = await firestoredb()
      .collection("addresses")
      .doc(id)
      .set(address_model, { merge: true });

    res.status(200).json({
      success: true,
      address,
    });
  }
);

exports.deleteAddress = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const id: string = req.query.id!.toString();
    const token = req.headers.authorization!;
    const userId: string = (await auth().verifyIdToken(token)).uid;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const address = await firestoredb()
      .collection("addresses")
      .doc(id)
      .delete();

    res.status(200).json({
      success: true,
      address,
    });
  }
);
