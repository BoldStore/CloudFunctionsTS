import { credential, initializeApp } from "firebase-admin";

initializeApp({
  credential: credential.applicationDefault(),
});

exports.users = require("./users");
exports.users = require("./addresses");
exports.products = require("./products");
exports.stores = require("./stores");
