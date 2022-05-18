import { Router } from "express";
import { explorePage, homePage, storePage } from "../controllers/page";
// eslint-disable-next-line new-cap
const router = Router();

router.route("home").get(homePage);
router.route("explore").get(explorePage);
router.route("store").get(storePage);

export = router;
