import { Router } from "express";
import { checkLogin, getInsta, respond } from "../controllers/test";
import { validateFirebaseIdToken } from "../middlewares/auth";
// eslint-disable-next-line new-cap
const router = Router();

router.route("/").get(respond);

router.route("/checkLogin").post(validateFirebaseIdToken, checkLogin);

router.route("/getInstaData").post(getInsta);

export = router;
