import { Router } from "express";
import { createInstance, destroyInstance } from "../../controller/instance.controller.js";


const router = Router();

router.post('/', createInstance);

router.delete('/', destroyInstance);

export default router;