import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { Plans, purchasePlan } from "../../controller/plans.controller.js";

const router = Router();

router.get('/', Plans);

router.post('/:id/purchase', authMiddleware, purchasePlan);


export default router;