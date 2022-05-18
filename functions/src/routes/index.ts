import { Router } from "express";
import * as addressRoutes from "./address";
import * as codeRoutes from "./code";
import * as pageRoutes from "./pages";
import * as storeRoutes from "./store";
import * as testRoutes from "../test";
// eslint-disable-next-line new-cap
const router = Router();

router.use("/address", addressRoutes);
router.use("/codes", codeRoutes);
router.use("/pages", pageRoutes);
router.use("/store", storeRoutes);
router.use("/test", testRoutes);

export = router;
