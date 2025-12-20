import { Router } from "express";
import { createInstance, destroyInstance, getAllInstance, getIndivisualInstance, restartInstance, startInstance, stopInstance } from "../../controller/instance.controller.js";


const router = Router();

// list all Instances
router.get("/", getAllInstance);

// Create Instance
router.post('/', createInstance);

// get a indivisual Instance
router.get("/:vmId", getIndivisualInstance)

// delete Instance
router.delete('/', destroyInstance);

// start Instance
router.put("/:vmId/start", startInstance)

// stop Instance
router.put("/:vmId/stop", stopInstance)

// restart Instance
router.put("/:vmId/restart", restartInstance)

export default router;