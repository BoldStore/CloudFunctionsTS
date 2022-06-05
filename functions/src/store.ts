import { https, Request, Response } from "firebase-functions/v1";
import { firestore } from "firebase-admin";
import cors = require("cors");
import { APP_NAME, transporter } from "./helper/mails";
import { AVI_MAIL, JAYESH_MAIL } from "./secrets";

exports.addPotentialStore = https.onRequest(
  async (req: Request, res: Response<any>) => {
    cors({
      origin: true,
    })(req, res, async () => {
      try {
        const insta_username = req.body.insta_username;
        const email = req.body.email;

        if (!insta_username) {
          res.status(400).json({
            success: false,
            message: "Insta username is required",
          });
          return;
        }

        if (!email) {
          res.status(400).json({
            success: false,
            message: "Email is required",
          });
          return;
        }

        const insta_stores = (
          await firestore()
            .collection("potentialStores")
            .where("insta_username", "==", insta_username)
            .get()
        ).docs;
        const email_stores = (
          await firestore()
            .collection("potentialStores")
            .where("email", "==", email)
            .get()
        ).docs;

        if (insta_stores.length > 0) {
          res.status(400).json({
            success: false,
            message: "Insta username already exists",
          });
          return;
        }

        if (email_stores.length > 0) {
          res.status(400).json({
            success: false,
            message: "Email already exists",
          });
          return;
        }

        // Save data
        await firestore().collection("potentialStores").add({
          insta_username,
          email,
        });

        const emails = `${JAYESH_MAIL}, ${AVI_MAIL}`;

        // Send mail to founders
        const mailOptions = {
          from: `${APP_NAME} <noreply@boldstore.com>`,
          to: emails,
          subject: "Boldstore - Potential Store",
          html: `
          <h1>Boldstore - Potential Store</h1>
          <p>
          Someone just submitted a potential store.
          </p>
          <p>
          Insta username: ${insta_username}
          <br>Email: ${email}
          </p>
          `,
          text: `
          BoldStore - Potential Store
          Someone just submitted a potential store.
          Insta username: ${insta_username}
          Email: ${email}
          `,
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
          success: true,
          message: "Your data has been saved",
        });
      } catch (e) {
        console.log("Error in saving data", e);
        res.status(400).json({
          success: false,
          message: "There was an error saving data",
          error: e,
        });
      }
    });
  }
);
