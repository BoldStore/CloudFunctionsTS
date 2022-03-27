import { createTransport } from "nodemailer";
import { readFile } from "fs";

const email = "";
const password = "";
const transporter = createTransport({
  service: "gmail",
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
  var html: string | undefined = undefined;
  readFile(htmlPath, "utf8", (err, data) => {
    if (err) {
      console.log(err);
      return null;
    } else {
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
};
