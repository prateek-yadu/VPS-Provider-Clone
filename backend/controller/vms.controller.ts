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

export const allVMs = async (req: Request, res: Response) => {
  const vmsList = await (await fetch(`${process.env.LXD_SERVER}/1.0/instances?project=${process.env.PROJECT}&recursion=2`)).json();
  res.send(vmsList);
};

export const getVM = async (req: Request, res: Response) => {
  const VMDetails = await (await fetch(`${process.env.LXD_SERVER}/1.0/instances/${req.params.vmId}?project=${process.env.PROJECT}&recursion=1`)).json();
  res.send(VMDetails);
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
          // NOTE: checks if VM ID is duplicate or not
          const vmID = `vm-${uuidv4()}`;

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

export const startVM = async (req: Request, res: Response) => {
  const startReq = await (await fetch(`${process.env.LXD_SERVER}/1.0/instances/${req.params.vmId}/state?project=${process.env.PROJECT}`, {
    method: "PUT",
    body: JSON.stringify({ "action": "start" })
  })).json();
  res.send(startReq);
};

export const stoptVM = async (req: Request, res: Response) => {
  const stopReq = await (await fetch(`${process.env.LXD_SERVER}/1.0/instances/${req.params.vmId}/state?project=${process.env.PROJECT}`, {
    method: "PUT",
    body: JSON.stringify({ "action": "stop", "force": true })
  })).json();
  res.send(stopReq);
};

export const restartVM = async (req: Request, res: Response) => {
  const restartReq = await (await fetch(`${process.env.LXD_SERVER}/1.0/instances/${req.params.vmId}/state?project=${process.env.PROJECT}`, {
    method: "PUT",
    body: JSON.stringify({ "action": "restart", "force": true })
  })).json();
  res.send(restartReq);
};

export const destroyVM = async (req: Request, res: Response) => {
  const destryReq = await (await fetch(`${process.env.LXD_SERVER}/1.0/instances/${req.params.vmId}?project=${process.env.PROJECT}`, {
    method: "DELETE"
  })).json();
  res.send(destryReq);
};