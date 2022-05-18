import { Router } from "express";
import * as addressRoutes from "./address";
import * as codeRoutes from "./code";
import * as testRoutes from "../test";
// eslint-disable-next-line new-cap
const router = Router();

router.use("/address", addressRoutes);
router.use("/codes", codeRoutes);
router.use("/test", testRoutes);

export = router;
