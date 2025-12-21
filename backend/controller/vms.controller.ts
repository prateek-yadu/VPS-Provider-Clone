import { Request, Response } from "express";
import send from "../utils/response/response.js";
import { pool } from "../db/config.js";
import { v4 as uuidv4 } from 'uuid';


// TODO: Put every thing in try catch block
// TODO: Add standard error and response logic

interface customRequest extends Request {
  id?: string;
}

interface instanceData {
  id: string;
  name?: string;
  description?: string;
  vCPU: number;
  memory: number;
  storage: number;
  status?: string;
  image?: string;
  ipAddress: string;
  userId?: string | undefined;
  userPlanId?: string;
  regionId?: string;
}

export const allVMs = async (req: customRequest, res: Response) => {

  try {
    const userId = req.id;

    const [vm]: any = await pool.query('SELECT i.name, i.description, i.status, m.full_name AS image, p.ip, r.name AS region_name, r.code AS region_code, up.expires_at, pl.name AS plan, pl.vCPU, pl.memory, pl.storage, pl.backups FROM instances i INNER JOIN ip_addresses p ON i.address_id=p.id INNER JOIN images m ON i.image_id=m.id INNER JOIN regions r ON i.region_id=r.id INNER JOIN user_plans up ON i.user_plan_id=up.id INNER JOIN plans pl ON up.plan_id=pl.id WHERE i.user_id=?', [userId]);

    if (vm.length != 0) {
      send.ok(res, "", vm);
    } else {
      send.notFound(res, "VM not found by this name.");
    }
  } catch (error) {
    send.internalError(res);
  }
};

export const getVM = async (req: customRequest, res: Response) => {

  try {
    const userId = req.id;
    const vmName = req.params.vmId;

    const [vm]: any = await pool.query('SELECT i.name, i.description, i.status, m.full_name AS image, p.ip, r.name AS region_name, r.code AS region_code, up.expires_at, pl.name AS plan, pl.vCPU, pl.memory, pl.storage, pl.backups FROM instances i INNER JOIN ip_addresses p ON i.address_id=p.id INNER JOIN images m ON i.image_id=m.id INNER JOIN regions r ON i.region_id=r.id INNER JOIN user_plans up ON i.user_plan_id=up.id INNER JOIN plans pl ON up.plan_id=pl.id WHERE i.name=? AND i.user_id=?', [vmName, userId]);

    if (vm.length != 0) {
      send.ok(res, "", vm[0]);
    } else {
      send.notFound(res, "VM not found by this name.");
    }
  } catch (error) {
    send.internalError(res);
  }
};

export const createVM = async (req: customRequest, res: Response) => {

  try {
    const { vmName, vmDescription, planId } = req.body; // gets user's subscribed plan ID
    const userId: string | undefined = req.id; // gets user ID

    // gets user plan details
    const [plan, fields]: any = await pool.query('SELECT u.in_use, u.expires_at, p.name, p.vCPU, p.memory, p.storage, p.backups FROM user_plans u INNER JOIN plans p ON u.plan_id=p.id WHERE u.id=? AND u.user_id=?', [planId, userId]);

    const currentDate = new Date();
    const expired: boolean = plan[0]?.expires_at <= currentDate;
    const inUse: boolean = plan[0]?.in_use === 1;

    // checks if plan exists
    if (plan.length != 0) {

      // check if plan is expired
      if (expired) {
        send.forbidden(res, "Plan Expired.");
      } else {

        // check if plan in use
        if (inUse) {
          send.forbidden(res, "Instance is already initialized with this plan.");
        } else {
          // generates VM's ID (stored as name in LXC/LXD and ID in DB)
          const vmID = `vm-${uuidv4()}`;

          // chcek if vm name is same or not
          const [vmExists]: any = await pool.query('SELECT name FROM instances WHERE name=? AND user_id=?', [vmName, userId]);

          // sends conflict error if vm name is already thier 
          if (vmExists.length != 0) {
            send.conflict(res, "VM already exists with this name");
            return;
          }

          // gets available IP
          const [ip, fields]: any = await pool.query('SELECT * FROM ip_addresses WHERE in_use=0 ORDER BY id ASC LIMIT 1');

          const assignableIP = ip[0].ip;
          const assignableIPId = ip[0].id;

          // cheks if IP exists to assign to VM
          if (assignableIP == undefined) {
            send.internalError(res); // No assignable IP Found
          } else {

            const vmData: instanceData = {
              id: vmID,
              vCPU: plan[0].vCPU,
              memory: plan[0].memory,
              storage: plan[0].storage,
              ipAddress: assignableIP,
            };

            const vmCreationRequest: any = await (await fetch(`${process.env.LXD_AGENT_SERVER}/api/v1/instance`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(vmData)
            })).json();

            if (vmCreationRequest.status === 200) {

              // set current ip in_use to true
              const [reserveIP, fields]: any = await pool.query('UPDATE ip_addresses SET in_use=1 WHERE id=?', [assignableIPId]);

              // sets userPlan in_use section to true (restricts creating multiple VMs from one plan)
              const [userPlan, userPlanfields]: any = await pool.query('UPDATE user_plans set in_use=1 WHERE id=?', planId);

              // NOTE: images and region are not yet been implementaed so its not fuctional (image and region is decided by lxd_agent)

              const [instance, instanceFields]: any = await pool.query('INSERT INTO instances (id, name, description, status, image_id, address_id, user_id, user_plan_id, region_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [vmID, vmName, vmDescription, "Provisioning", 1, ip[0].id, userId, planId, 1]);

              send.ok(res, "VM Created Successfully");
            } else {
              // error coz VM creation might have failed
              send.internalError(res);
            }
          }
        }
      }
    } else {
      send.notFound(res, "Plan does not exist.");
    }
  } catch (error) {
    send.internalError(res);
  }
};

export const startVM = async (req: customRequest, res: Response) => {

  try {
    const userId = req.id;
    const vmName = req.params.vmId;

    const [vmExists]: any = await pool.query('SELECT id AS vm_id, name, status, user_plan_id FROM instances WHERE name=? AND user_id=?', [vmName, userId]);

    const planId = vmExists[0]?.user_plan_id;
    const vmStatus = vmExists[0]?.status;
    const vmId = vmExists[0]?.vm_id;

    if (vmExists.length != 0) {
      // gets plan from VM is provisioned
      const [plan]: any = await pool.query('SELECT u.in_use, u.expires_at, p.name, p.vCPU, p.memory, p.storage, p.backups FROM user_plans u INNER JOIN plans p ON u.plan_id=p.id WHERE u.id=? AND u.user_id=?', [planId, userId]);

      const currentDate = new Date();
      const expired: boolean = plan[0]?.expires_at <= currentDate;

      // cheks if plan is expired
      if (expired) {
        send.forbidden(res, "Can not perform any action plan expired.");
      } else {
        if (vmStatus === "Running") {
          send.badRequest(res, "VM is already Running.");
        } else {
          const vmStartReq: any = await (await fetch(`${process.env.LXD_AGENT_SERVER}/api/v1/instance/${vmId}/start`, {
            method: "PUT"
          })).json();

          if (vmStartReq.status === 200) {
            // update state in DB
            const [updateState]: any = await pool.query('UPDATE instances SET status=? WHERE id=?', ["Running", vmId]);

            send.ok(res, "VM started successfully");
          } else {
            send.internalError(res);
          }
        }
      }
    } else {
      send.notFound(res, "VM not found");
    }
  } catch (error) {
    send.internalError(res);
  }
};

export const stoptVM = async (req: customRequest, res: Response) => {

  try {
    const userId = req.id;
    const vmName = req.params.vmId;

    const [vmExists]: any = await pool.query('SELECT id AS vm_id, name, status, user_plan_id FROM instances WHERE name=? AND user_id=?', [vmName, userId]);

    const planId = vmExists[0]?.user_plan_id;
    const vmStatus = vmExists[0]?.status;
    const vmId = vmExists[0]?.vm_id;

    if (vmExists.length != 0) {
      // gets plan from VM is provisioned
      const [plan]: any = await pool.query('SELECT u.in_use, u.expires_at, p.name, p.vCPU, p.memory, p.storage, p.backups FROM user_plans u INNER JOIN plans p ON u.plan_id=p.id WHERE u.id=? AND u.user_id=?', [planId, userId]);

      const currentDate = new Date();
      const expired: boolean = plan[0]?.expires_at <= currentDate;

      // cheks if plan is expired
      if (expired) {
        send.forbidden(res, "Can not perform any action plan expired.");
      } else {
        if (vmStatus === "Stopped") {
          send.badRequest(res, "VM is already Stopped.");
        } else {
          const vmStopReq: any = await (await fetch(`${process.env.LXD_AGENT_SERVER}/api/v1/instance/${vmId}/stop`, {
            method: "PUT"
          })).json();

          if (vmStopReq.status === 200) {
            // update state in DB
            const [updateState]: any = await pool.query('UPDATE instances SET status=? WHERE id=?', ["Stopped", vmId]);

            send.ok(res, "VM Stopped successfully.");
          } else {
            send.internalError(res);
          }
        }
      }
    } else {
      send.notFound(res, "VM not found");
    }
  } catch (error) {
    send.internalError(res);
  }
};

export const restartVM = async (req: customRequest, res: Response) => {
  try {
    const userId = req.id;
    const vmName = req.params.vmId;

    const [vmExists]: any = await pool.query('SELECT id AS vm_id, name, status, user_plan_id FROM instances WHERE name=? AND user_id=?', [vmName, userId]);

    const planId = vmExists[0]?.user_plan_id;
    const vmStatus = vmExists[0]?.status;
    const vmId = vmExists[0]?.vm_id;

    if (vmExists.length != 0) {
      // gets plan from VM is provisioned
      const [plan]: any = await pool.query('SELECT u.in_use, u.expires_at, p.name, p.vCPU, p.memory, p.storage, p.backups FROM user_plans u INNER JOIN plans p ON u.plan_id=p.id WHERE u.id=? AND u.user_id=?', [planId, userId]);

      const currentDate = new Date();
      const expired: boolean = plan[0]?.expires_at <= currentDate;

      // cheks if plan is expired
      if (expired) {
        send.forbidden(res, "Can not perform any action plan expired.");
      } else {
        if (vmStatus === "Stopped") {
          send.badRequest(res, "VM is not Running.");
        } else {
          const vmRestartReq: any = await (await fetch(`${process.env.LXD_AGENT_SERVER}/api/v1/instance/${vmId}/restart`, {
            method: "PUT"
          })).json();

          if (vmRestartReq.status === 200) {
            send.ok(res, "VM is restarting.");
          } else {
            send.internalError(res);
          }
        }
      }
    } else {
      send.notFound(res, "VM not found");
    }
  } catch (error) {
    send.internalError(res);
  }
};

export const destroyVM = async (req: customRequest, res: Response) => {

  try {
    const userId = req.id;
    const vmName = req.params.vmId;

    const [vmExists]: any = await pool.query('SELECT i.id AS vm_id, p.id AS ip_id, i.name, i.status, p.ip, i.user_plan_id FROM instances i INNER JOIN ip_addresses p ON i.address_id=p.id WHERE i.name=? AND i.user_id=?', [vmName, userId]);

    const planId = vmExists[0]?.user_plan_id;
    const vmStatus = vmExists[0]?.status;
    const vmId = vmExists[0]?.vm_id;
    const vmIPId = vmExists[0]?.ip_id;

    if (vmExists.length != 0) {
      // gets plan from VM is provisioned
      const [plan]: any = await pool.query('SELECT u.in_use, u.expires_at, p.name, p.vCPU, p.memory, p.storage, p.backups FROM user_plans u INNER JOIN plans p ON u.plan_id=p.id WHERE u.id=? AND u.user_id=?', [planId, userId]);

      const currentDate = new Date();
      const expired: boolean = plan[0]?.expires_at <= currentDate;

      // cheks if plan is expired
      if (expired) {
        send.forbidden(res, "Can not perform any action plan expired.");
      } else {
        if (vmStatus !== "Stopped") {
          send.badRequest(res, "Stop the VM first");
        } else {

          // send data to lxd agent to delete VM
          const vmDeletetionReq: any = await (await fetch(`${process.env.LXD_AGENT_SERVER}/api/v1/instance`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ id: vmId })
          })).json();

          if (vmDeletetionReq.status === 200) {
            // delete data from instance table
            const [deleteVM]: any = await pool.query('DELETE FROM instances WHERE id=?', [vmId]);

            // release user plan from in_use
            const [releaseUserPlan]: any = await pool.query('UPDATE user_plans SET in_use=0 WHERE id=?', [planId]);

            // release reserved IP
            const [releaseIP]: any = await pool.query('UPDATE ip_addresses SET in_use=0 WHERE id=?', [vmIPId]);

            send.ok(res, "VM deleted successfully.");
          } else {
            send.internalError(res);
          }
        }
      }

    } else {
      send.notFound(res, "VM not found");
    }
  } catch (error) {
    send.internalError(res);
  }

};