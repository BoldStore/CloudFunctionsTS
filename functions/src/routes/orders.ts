import { Router } from "express";
import {
  callback,
  checkForDelivery,
  createOrder,
  getOrder,
  previousOrders,
  verify,
} from "../controllers/orders";
import { validateFirebaseIdToken } from "../middlewares/auth";
// eslint-disable-next-line new-cap
const router = Router();

router
  .route("/")
  .post(validateFirebaseIdToken, createOrder)
  .get(validateFirebaseIdToken, previousOrders);

router.route("/get").get(validateFirebaseIdToken, getOrder);

router.route("/verify").post(validateFirebaseIdToken, verify);
router.route("/callback").post(callback);

router.route("/delivery").post(checkForDelivery);

export = router;
