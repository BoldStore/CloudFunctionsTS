import { Router } from "express";
import { addInviteToken } from "../controllers/code";
import { validateFirebaseIdToken } from "../middlewares/auth";
// eslint-disable-next-line new-cap
const router = Router();

router.route("/").get(validateFirebaseIdToken, addInviteToken);

export = router;
