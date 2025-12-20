import { Router } from "express";
import { createInstance, destroyInstance, restartInstance, startInstance, stopInstance } from "../../controller/instance.controller.js";


const router = Router();

// Create Instance
router.post('/', createInstance);

// delete Instance
router.delete('/', destroyInstance);

// start Instance
router.put("/:vmId/start", startInstance)

// stop Instance
router.put("/:vmId/stop", stopInstance)

// restart Instance
router.put("/:vmId/restart", restartInstance)

export default router;