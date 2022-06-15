import { Router } from "express";
import {
  addPotentialStore,
  checkIfStore,
  createStore,
  saveStoreData,
  updateStore,
  updateStoreProducts,
} from "../controllers/store";
import { deleteStore } from "../meili";
import { validateFirebaseIdToken } from "../middlewares/auth";
// eslint-disable-next-line new-cap
const router = Router();

router
  .route("/")
  .post(validateFirebaseIdToken, createStore)
  .get(validateFirebaseIdToken, checkIfStore)
  .delete(validateFirebaseIdToken, deleteStore);

router.route("/saveStoreData").post(validateFirebaseIdToken, saveStoreData);

router
  .route("/update")
  .get(validateFirebaseIdToken, updateStoreProducts)
  .post(validateFirebaseIdToken, updateStore);

router.route("/potentialStore").post(addPotentialStore);

export = router;
