import { credential, initializeApp } from "firebase-admin";

initializeApp({
  credential: credential.applicationDefault(),
});

exports.users = require("./users");
exports.products = require("./products");
exports.stores = require("./stores");
