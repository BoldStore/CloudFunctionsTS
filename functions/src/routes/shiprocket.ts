import { Router } from "express";
import { getAccessToken, getAddresses } from "../controllers/shiprocket";
// eslint-disable-next-line new-cap
const router = Router();

router.route("/").get(getAccessToken);
router.route("/addresses").get(getAddresses);

export = router;
