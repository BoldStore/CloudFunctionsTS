import { Router } from "express";
import {
  addAddress,
  deleteAddress,
  getUserAddresses,
  updateAddress,
} from "../controllers/address";
import { validateFirebaseIdToken } from "../middlewares/auth";
// eslint-disable-next-line new-cap
const router = Router();

router
  .route("/")
  .get(validateFirebaseIdToken, getUserAddresses)
  .post(validateFirebaseIdToken, addAddress)
  .patch(validateFirebaseIdToken, updateAddress)
  .delete(validateFirebaseIdToken, deleteAddress);

export = router;
