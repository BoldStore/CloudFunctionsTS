import { auth, https, Request, Response } from "firebase-functions/v1";
import { firestore as firestoredb } from "firebase-admin";
import { getInstaData } from "./helper/get_insta_data";
import { sendMail } from "./helper/mails";
import { checkAuth } from "./helper/check_auth";

exports.createUser = auth.user().onCreate(async (user) => {
  const email: string = user.email!.toString();

  // const user_model = new User(email);

  // await firestoredb().collection("users").doc(user.uid).set(user_model);

  sendMail(
    email,
    "Welcome to Bold",
    "Welcome to Bold",
    "/templates/welcome_mail.html"
  );
});

exports.userToDb = https.onRequest(async (req: Request, res: Response<any>) => {
  const id = (await checkAuth(req, res))!.userId!;
  const email = req.body.email;

  const user = await firestoredb().collection("users").doc(id).get();
  const store = await firestoredb().collection("stores").doc(id).get();

  if (user.exists) {
    res.status(400).json({
      success: false,
      message: "User already exists",
    });
    return;
  }

  if (store.exists) {
    res.status(400).json({
      success: false,
      message: "Store already exists",
    });
    return;
  }

  await firestoredb().collection("users").doc(id).set({
    email,
  });

  res.status(201).json({
    success: true,
  });
});

exports.addInstaUsername = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const id = (await checkAuth(req, res))!.userId!;

    const insta_username = req.body.insta_username!.toString();

    const data = await getInstaData(insta_username);

    const user = await firestoredb().collection("users").doc(id).set(
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
    const id = (await checkAuth(req, res))!.userId!;

    const user = (await firestoredb().collection("users").doc(id).get()).data();

    res.status(200).json({
      success: true,
      user,
    });
  }
);

exports.updateUser = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const id = (await checkAuth(req, res))!.userId!;

    const name = req.body.name;
    const birthday = req.body.birthday;
    const sizePreference = req.body.sizePreference;
    // const insta_username = req.body.insta_username;
    const phone = req.body.phone;

    const user = await firestoredb().collection("users").doc(id).update({
      name,
      birthday,
      sizePreference,
      // insta_username,
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
    const id = (await checkAuth(req, res))!.userId!;

    const user = await firestoredb().collection("users").doc(id).update({
      deletedOn: new Date(),
    });

    res.status(200).json({
      success: true,
      user,
    });
  }
);
