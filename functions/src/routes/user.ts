import { Router } from "express";
import {
  addInstaUsername,
  createUser,
  deleteUser,
  getPersonalDetails,
  updateUser,
} from "../controllers/user";
import { validateFirebaseIdToken } from "../middlewares/auth";
// eslint-disable-next-line new-cap
const router = Router();

router
  .route("/")
  .get(validateFirebaseIdToken, getPersonalDetails)
  .post(validateFirebaseIdToken, createUser)
  .patch(validateFirebaseIdToken, updateUser)
  .delete(validateFirebaseIdToken, deleteUser);

router.route("/instaUsername").post(validateFirebaseIdToken, addInstaUsername);

export = router;
