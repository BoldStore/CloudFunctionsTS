import { auth, https, Request, Response } from "firebase-functions/v1";
import { firestore as firestoredb, auth as adminAuth } from "firebase-admin";
import { getInstaData } from "./helper/get_insta_data";

exports.createUser = auth.user().onCreate(async (user) => {
  const email: string = user.email!.toString();

  const user_model = new User(email);

  await firestoredb().collection("users").doc(user.uid).set(user_model);
});

exports.addInstaUsername = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const token = req.headers.authorization!;
    const id: string = (await adminAuth().verifyIdToken(token)).uid;

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const insta_username = req.body.insta_username!.toString();

    const data = await getInstaData(insta_username);

    const user = await firestoredb()
      .collection("users")
      .doc(id)
      .set(
        {
          insta_username: insta_username,
          name: data.full_name,
          imgUrl: data.profile_pic,
        },
        { merge: true }
      );

    res.status(200).json({
      success: true,
      user,
    });
  }
);

exports.getPersonalDetails = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const token = req.headers.authorization!;
    const id: string = (await adminAuth().verifyIdToken(token)).uid;

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const user = await firestoredb().collection("users").doc(id).get();

    res.status(200).json({
      success: true,
      user,
    });
  }
);

exports.updateUser = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const token = req.headers.authorization!;
    const id: string = (await adminAuth().verifyIdToken(token)).uid;

    if (!id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const name = req.body.name;
    const birthday = req.body.birthday;
    const sizePreference = req.body.sizePreference;
    const insta_username = req.body.insta_username;
    const phone = req.body.phone;

    const user = await firestoredb().collection("users").doc(id).update({
      name,
      birthday,
      sizePreference,
      insta_username,
      phone,
    });

    res.status(200).json({
      success: true,
      user,
    });
  }
);

exports.deleteUser = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const id: string = req.query.id!.toString();

    const user = await firestoredb().collection("users").doc(id).update({
      deletedOn: new Date(),
    });

    res.status(200).json({
      success: true,
      user,
    });
  }
);
