import { Router } from "express";
import { getProfile } from "../controllers/profile";
import { validateFirebaseIdToken } from "../middlewares/auth";
// eslint-disable-next-line new-cap
const router = Router();

router.route("/").get(validateFirebaseIdToken, getProfile);

export = router;
