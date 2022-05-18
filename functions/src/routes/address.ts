import { Router } from "express";
import { addAddress } from "../controllers/address";
import { validateFirebaseIdToken } from "../middlewares/auth";
// eslint-disable-next-line new-cap
const router = Router();

router.post("addAddress", validateFirebaseIdToken, addAddress);

export = router;
