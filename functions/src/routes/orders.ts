import { Router } from "express";
import {
  callback,
  checkForDelivery,
  createOrder,
  previousOrders,
  verify,
} from "../controllers/orders";
import { validateFirebaseIdToken } from "../middlewares/auth";
// eslint-disable-next-line new-cap
const router = Router();

router
  .route("/")
  .get(validateFirebaseIdToken, createOrder)
  .post(validateFirebaseIdToken, previousOrders);

router.route("/verify").post(validateFirebaseIdToken, verify);
router.route("/callback").post(callback);

router.route("/delivery").post(checkForDelivery);

export = router;
