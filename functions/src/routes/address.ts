import { Router } from "express";
import { addAddress } from "../controllers/address";
// eslint-disable-next-line new-cap
const router = Router();

router.post("addAddress", addAddress);

export = router;
