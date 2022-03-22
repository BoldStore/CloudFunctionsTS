import { https, Request, Response } from "firebase-functions/v1";
import { firestore as firestoredb } from "firebase-admin";

exports.createUser = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const name = req.body.name;
    const email = req.body.email;
    const birthday = req.body.birthday;
    const sizePreference = req.body.sizePreference;
    const insta_username = req.body.insta_username;
    const loginType = "email";
    const phone = req.body.phone;

    const user = new User(
      name,
      email,
      birthday,
      sizePreference,
      insta_username,
      loginType,
      phone
    );

    await firestoredb().collection("messages").add(user);

    res.status(201).json({
      success: true,
      user,
    });
  }
);

exports.getUser = https.onRequest(async (req: Request, res: Response<any>) => {
  const id: string = req.query.id!.toString();

  const user = await firestoredb().collection("messages").doc(id).get();

  res.status(201).json({
    success: true,
    user,
  });
});

exports.updateUser = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const id: string = req.query.id!.toString();
    const name = req.body.name;
    const birthday = req.body.birthday;
    const sizePreference = req.body.sizePreference;
    const insta_username = req.body.insta_username;
    const phone = req.body.phone;

    const user = await firestoredb().collection("messages").doc(id).update({
      name,
      birthday,
      sizePreference,
      insta_username,
      phone,
    });

    res.status(201).json({
      success: true,
      user,
    });
  }
);

exports.deleteUser = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const id: string = req.query.id!.toString();

    const user = await firestoredb().collection("messages").doc(id).update({
      deletedOn: new Date(),
    });

    res.status(201).json({
      success: true,
      user,
    });
  }
);
