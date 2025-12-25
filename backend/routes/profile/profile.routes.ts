import { Router } from "express";
import { me, subscribedPlans } from "../../controller/me.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const router = Router();

router.get("/me", me);

// user subscribed plans 
router.get("/me/plans", subscribedPlans);

export default router;