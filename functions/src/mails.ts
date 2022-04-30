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
    readFile("src" + htmlPath, "utf8", (err, data) => {
      if (err) {
        console.log("File error", err);
        return null;
      } else {
        console.log(data);
        html = data;
        return;
      }
    });

    const mailOptions = {
      from: `${APP_NAME} <noreply@boldstore.com>`,
      to: email,
      subject: subject,
      text: text,
      html: html,
    };

    await transporter.sendMail(mailOptions);
  } catch (e) {
    console.log("Error>>>>", e);
  }
};
