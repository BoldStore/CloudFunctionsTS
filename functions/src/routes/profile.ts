import { Router } from "express";
import { getProfile, linkUser } from "../controllers/profile";
import { validateFirebaseIdToken } from "../middlewares/auth";
// eslint-disable-next-line new-cap
const router = Router();

router.route("/").get(validateFirebaseIdToken, getProfile);
router.route("/link").get(validateFirebaseIdToken, linkUser);

export = router;
