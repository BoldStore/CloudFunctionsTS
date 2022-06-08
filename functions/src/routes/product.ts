import { Router } from "express";
import { getProductData } from "../controllers/product";
// eslint-disable-next-line new-cap
const router = Router();

router.route("/").post(getProductData);

export = router;
