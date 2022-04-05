import { credential, initializeApp } from "firebase-admin";
import { Razorpay } from "razorpay-typescript";

// Initialize razorpay instance
export const razorpayInstance: Razorpay = new Razorpay({
  authKey: {
    key_id: process.env.RAZORPAY_KEY!.toString(),
    key_secret: process.env.RAZORPAY_SECRET!.toString(),
  },
});

initializeApp({
  credential: credential.applicationDefault(),
});

exports.users = require("./users");
exports.addresses = require("./addresses");
exports.products = require("./products");
exports.stores = require("./stores");
exports.orders = require("./orders");
exports.shipping = require("./shipping");
exports.codes = require("./codes");
