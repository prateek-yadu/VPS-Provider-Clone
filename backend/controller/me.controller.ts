import { pool } from "../db/config.js";
import send from "../utils/response/response.js";
import { Request, Response } from "express";

interface customRequest extends Request {
    id?: string;
}

export const me = async (req: customRequest, res: Response) => {

    try {
        const id = req.id; // gets user id 

        // fetches user data 
        const [user, fields]: any = await pool.query('SELECT name, email, phone, profile_image as profileImage FROM users WHERE id=?', [id]);

        if (user.length != 0) {
            // sends user data 
            send.ok(res, "User Found", user[0]);
        } else {
            send.notFound(res, "User Not Found");
        }
    } catch (error) {
        send.internalError(res);
    }
};