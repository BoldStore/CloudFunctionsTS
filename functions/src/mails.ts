import { createTransport } from "nodemailer";
import { readFile } from "fs";
import { EMAIL, PASSWORD } from "./secrets";

const email = EMAIL;
const password = PASSWORD;

const transporter = createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: email,
    pass: password,
  },
});

const APP_NAME = "Bold";

export const sendMail = async (
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
  } catch (e) {
    console.log("Error>>>>", e);
  }
};
