import { auth, https, Request, Response } from "firebase-functions/v1";
import { firestore as firestoredb } from "firebase-admin";
import { getInstaData } from "./helper/get_insta_data";
import { sendMail } from "./mails";
import { checkAuth } from "./helper/check_auth";

// Check if auth is working
exports.newUser = auth.user().onCreate(async (user) => {
  const email: string = user.email!.toString();

  sendMail(
    email,
    "Welcome to Bold",
    "Welcome to Bold",
    "/templates/welcome_mail.html"
  );
});

// Check if user is logged in
exports.checkLogin = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const id = (await checkAuth(req, res))!;

    if (!id) {
      res.status(403).json({
        success: false,
        message: "Not logged in",
      });
    }

    const user = (await firestoredb().collection("users").doc(id).get()).data();

    res.status(200).json({
      success: true,
      user,
      id,
    });
  }
);

// Insta data check
exports.getInstaData = https.onRequest(
  async (req: Request, res: Response<any>) => {
    const insta_username = req.body.insta_username!.toString();

    const data = await getInstaData(insta_username);

    if (!data) {
      res.status(400).json({
        success: false,
        message: "There was an errro",
      });
    }

    res.status(200).json({
      success: true,
      insta_username,
      data,
    });
  }
);
