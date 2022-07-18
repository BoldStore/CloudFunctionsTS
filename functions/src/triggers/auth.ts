import { user } from "firebase-functions/v1/auth";
import { sendMail } from "../helper/mails";

exports.createUser = user().onCreate(async (user) => {
  if (!user.email) {
    return;
  }

  const email: string = user.email?.toString();

  sendMail(
    email,
    "Welcome to Bold",
    "Welcome to Bold",
    "/templates/welcome_mail.html"
  );
});
