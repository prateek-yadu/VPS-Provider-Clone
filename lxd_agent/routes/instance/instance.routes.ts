import { Router } from "express";
import { createInstance } from "../../controller/instance.controller.js";


const router = Router();

router.post('/', createInstance);

export default router;