/* eslint-disable @typescript-eslint/no-unused-vars */
import { credential, initializeApp } from "firebase-admin";
import { runWith } from "firebase-functions/v1";
import { Razorpay } from "razorpay-typescript";
import { RAZORPAY_KEY, RAZORPAY_SECRET } from "./secrets";

import * as cors from "cors";
import * as express from "express";
import * as routes from "./routes";
import ExpressError = require("./utils/ExpressError");

// Initialize razorpay instance
export const razorpayInstance: Razorpay = new Razorpay({
  authKey: {
    key_id: RAZORPAY_KEY?.toString(),
    key_secret: RAZORPAY_SECRET?.toString(),
  },
});

initializeApp({
  credential: credential.applicationDefault(),
});

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use("/", routes);

// Check for errors
app.use(
  (
    err: ExpressError,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong!";
    // if (process.env.NODE_ENV !== "production") {
    res.status(statusCode).send({ err }).end();
    // } else {
    //   res.status(500).send({ success: false, message: "Something went wrong" });
    // }
  }
);

exports.app = runWith({ memory: "2GB", timeoutSeconds: 360 }).https.onRequest(
  app
);
exports.triggers = require("./triggers");
exports.meili = require("./meili");
