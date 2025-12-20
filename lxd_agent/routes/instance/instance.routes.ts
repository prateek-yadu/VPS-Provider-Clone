import { Router } from "express";
import { createInstance, destroyInstance, startInstance, stopInstance } from "../../controller/instance.controller.js";


const router = Router();

// Create VM
router.post('/', createInstance);

// delete VM
router.delete('/', destroyInstance);

// start VM
router.put("/:vmId/start", startInstance)

// stop VM
router.put("/:vmId/stop", stopInstance)

export default router;