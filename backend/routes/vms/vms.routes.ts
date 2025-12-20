import { Router } from "express";
import { allVMs, createVM, destroyVM, getVM, restartVM, startVM, stoptVM } from "../../controller/vms.controller.js";

const router = Router();

// list all VMs
router.get("/", allVMs);

// creates VM
router.post("/", createVM);

// get a indivisual VM
router.get("/:vmId", getVM)

// destroys a VM
router.delete("/:vmId", destroyVM)

// starts VM
router.put("/:vmId/start", startVM)

// stops VM
router.put("/:vmId/stop", stoptVM)

// restarts VM 
router.put("/:vmId/restart", restartVM)


export default router;
