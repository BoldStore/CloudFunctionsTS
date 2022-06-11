import { Router } from "express";
import { getProductData, getProduct } from "../controllers/product";
// eslint-disable-next-line new-cap
const router = Router();

router.route("/").get(getProduct).post(getProductData);

export = router;
