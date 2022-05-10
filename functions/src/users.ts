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
  try {
    const authData = await checkAuth(req, res);
    const id = authData!.userId!;
    const email = authData!.email;

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
      user: {
        email: email,
      },
    });
  } catch (e) {
    console.log("Error in adding user", e);
    res.status(500).json({
      success: false,
      message: "Error in adding user",
      error: e,
    });
  }
});

exports.addInstaUsername = https.onRequest(
  async (req: Request, res: Response<any>) => {
    try {
      const id = (await checkAuth(req, res))!.userId!;

      const insta_username = req.body.insta_username!.toString();

      // Check if already exists
      const userDb = (
        await firestoredb()
          .collection("users")
          .where("insta_username", "==", insta_username)
          .limit(1)
          .get()
      ).docs;

      if (userDb.length > 0) {
        res.status(400).json({
          success: false,
          message: "Instagram username already exists",
        });
        return;
      }

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
        user: {
          insta_username: insta_username,
          name: data.full_name,
          imgUrl: data.profile_pic,
        },
        userResult: user,
      });
    } catch (e) {
      console.log("Error in adding insta username", e);
      res.status(500).json({
        success: false,
        message: "Error in adding insta username",
        error: e,
      });
    }
  }
);

exports.getPersonalDetails = https.onRequest(
  async (req: Request, res: Response<any>) => {
    try {
      const id = (await checkAuth(req, res))!.userId!;

      const user = (
        await firestoredb().collection("users").doc(id).get()
      ).data();

      res.status(200).json({
        success: true,
        user,
      });
    } catch (e) {
      console.log("Error in getting personal details", e);
      res.status(500).json({
        success: false,
        message: "Error in getting personal details",
        error: e,
      });
    }
  }
);

exports.updateUser = https.onRequest(
  async (req: Request, res: Response<any>) => {
    try {
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
    } catch (e) {
      console.log("Error in updating user", e);
      res.status(500).json({
        success: false,
        message: "Error in updating user",
        error: e,
      });
    }
  }
);

exports.deleteUser = https.onRequest(
  async (req: Request, res: Response<any>) => {
    try {
      const id = (await checkAuth(req, res))!.userId!;

      const user = await firestoredb().collection("users").doc(id).update({
        deletedOn: new Date(),
      });

      res.status(200).json({
        success: true,
        user,
      });
    } catch (e) {
      console.log("Error in deleting user", e);
      res.status(500).json({
        success: false,
        message: "Error in deleting user",
        error: e,
      });
    }
  }
);
