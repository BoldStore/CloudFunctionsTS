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
  .get("getUserAddresses", validateFirebaseIdToken, getUserAddresses)
  .post("addAddress", validateFirebaseIdToken, addAddress)
  .patch("updateAddress", validateFirebaseIdToken, updateAddress)
  .delete("deleteAddress", validateFirebaseIdToken, deleteAddress);

export = router;
