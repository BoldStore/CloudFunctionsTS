import { credential, initializeApp } from "firebase-admin";
import { Razorpay } from "razorpay-typescript";
import { RAZORPAY_KEY, RAZORPAY_SECRET } from "./secrets";

// Initialize razorpay instance
export const razorpayInstance: Razorpay = new Razorpay({
  authKey: {
    key_id: RAZORPAY_KEY!.toString(),
    key_secret: RAZORPAY_SECRET!.toString(),
  },
});

initializeApp({
  credential: credential.applicationDefault(),
});

exports.users = require("./users");
exports.addresses = require("./address");
exports.products = require("./products");
exports.stores = require("./store");
exports.orders = require("./orders");
exports.shipping = require("./shipping");
exports.codes = require("./codes");
exports.tests = require("./test");
exports.pages = require("./pages");
