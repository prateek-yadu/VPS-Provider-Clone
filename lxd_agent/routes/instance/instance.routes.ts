import { Router } from "express";
import { createInstance, destroyInstance, startInstance } from "../../controller/instance.controller.js";


const router = Router();

// Create VM
router.post('/', createInstance);

// delete VM
router.delete('/', destroyInstance);

// start VM
router.put("/:vmId/start", startInstance)

export default router;