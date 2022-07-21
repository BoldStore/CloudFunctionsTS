import { createTransport } from "nodemailer";
import { readFile } from "fs";
import {
  EMAIL,
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_REFRESH_TOKEN,
} from "../secrets";

// export const transporter = createTransport({
//   host: "smtp.gmail.com",
//   port: 465,
//   secure: true,
//   auth: {
//     type: "OAuth2",
//     user: EMAIL,
//     pass: PASSWORD,
//     clientId: OAUTH_CLIENT_ID,
//     clientSecret: OAUTH_CLIENT_SECRET,
//     refreshToken: OAUTH_REFRESH_TOKEN,
//   },
// });

export const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: EMAIL,
    clientId: OAUTH_CLIENT_ID,
    clientSecret: OAUTH_CLIENT_SECRET,
    refreshToken: OAUTH_REFRESH_TOKEN,
  },
});

export const APP_NAME = "Bold";

export const sendMail: (
  email: string,
  subject: string,
  text: string,
  htmlPath: string
) => Promise<void> = async (
  email: string,
  subject: string,
  text: string,
  htmlPath: string
) => {
  let html: string | undefined = undefined;

  try {
    readFile("src" + htmlPath, "utf8", async (err, data) => {
      if (err) {
        console.log("File error", err);
        return null;
      } else {
        html = data;
        const mailOptions = {
          from: `${APP_NAME} <noreply@boldstore.com>`,
          to: email,
          subject: subject,
          html: html,
          text: text,
        };

        await transporter.sendMail(mailOptions);
        return;
      }
    });
    return;
  } catch (e) {
    console.log("Error sending mail>>", e);
  }
};
