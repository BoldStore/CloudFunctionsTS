import { Router } from "express";
import {
  checkLogin,
  deleteStoreData,
  getInsta,
  respond,
  saveProduct,
} from "../controllers/test";
import { validateFirebaseIdToken } from "../middlewares/auth";
// eslint-disable-next-line new-cap
const router = Router();

router.route("/").get(respond);

router.route("/checkLogin").post(validateFirebaseIdToken, checkLogin);

router.route("/getInstaData").post(getInsta);

router.route("/caraousel").post(validateFirebaseIdToken, saveProduct);

router.route("/deleteStore").get(validateFirebaseIdToken, deleteStoreData);

export = router;
