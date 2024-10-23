import { Router } from "express";
import { varifyJWT} from "../middlewares/auth.middleware.js"
import {} from "../controllers/subscription.controller.js"


const router = Router()
router.use(varifyJWT);

router.route("/").get()

export default router;