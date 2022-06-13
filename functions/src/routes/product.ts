import { Router } from "express";
import {
  getProductData,
  getProduct,
  saveProduct,
  getSavedProducts,
} from "../controllers/product";
import { validateFirebaseIdToken } from "../middlewares/auth";
// eslint-disable-next-line new-cap
const router = Router();

router.route("/").get(getProduct).post(getProductData);
router
  .route("/save")
  .get(validateFirebaseIdToken, getSavedProducts)
  .post(validateFirebaseIdToken, saveProduct);

export = router;
