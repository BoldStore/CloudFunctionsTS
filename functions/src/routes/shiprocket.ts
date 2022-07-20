import { Router } from "express";
import {
  getAccessToken,
  getAddresses,
  triggerShipment,
} from "../controllers/shiprocket";
// eslint-disable-next-line new-cap
const router = Router();

router.route("/").get(getAccessToken);
router.route("/addresses").get(getAddresses);
router.route("/ship").get(triggerShipment);

export = router;
