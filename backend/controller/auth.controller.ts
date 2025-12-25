import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from "express";
import send from "../utils/response/index.js";
import { pool } from '../db/config.js';
import jwt from 'jsonwebtoken';

interface userData {
    name: string;
    email: string;
    profileImage: string;
}

export const Login = async (req: Request, res: Response) => {

    try {
        const { email, password } = req.body;

        // checks if user exists
        const [exists, fields]: any = await pool.query('SELECT id, name, profile_image, password FROM users WHERE email = ?', [email]);

        if (exists.length != 0) {
            // checks password is vailed or not
            const vailed = await bcrypt.compare(password, exists[0].password);

            // if password is vailed send genrate and send token else thow error
            if (vailed) {

                // stores user data to send frontend
                const userInfo: userData = {
                    name: exists[0].name,
                    email: email,
                    profileImage: exists[0].profile_image
                };

                // genrates token
                const token = jwt.sign({ id: exists[0].id }, process.env.JWT_SECRET || "shhh...", {
                    expiresIn: '1d'
                });

                // sets cookie 
                res.cookie("token", token, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000, // vailed till 24 hrs
                    secure: process.env.IN_PROD == "true" && true || false
                });

                // sends response
                send.ok(res, "User Authenticated Successfully", { ...userInfo });
            } else {
                send.unauthorized(res, "Invailed Credentials");
            }
        } else {
            send.unauthorized(res, "Invailed Credentials");
        }
    } catch (error) {
        send.internalError(res);
    }
};

export const Register = async (req: Request, res: Response) => {

    try {
        const { name, email, password } = req.body;
        const saltRounds: number = typeof (process.env.SALTROUNDS) == "string" && parseInt(process.env.SALTROUNDS) || 10;// adds salt rounds
        // checks if user exists 
        const [exists, fields]: any = await pool.query('SELECT email FROM users WHERE email = ?', [email]);

        if (exists.length != 0) {
            // return duplicate user error
            send.conflict(res, "User Already Exists");
        } else {
            const userId = uuidv4(); // genrates uniqe user ID
            const hash = bcrypt.hashSync(password, saltRounds); // genrates hashed password

            // creates user
            const sql = 'INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)';
            const values = [userId, name, email, hash];
            const [result, fields] = await pool.execute(sql, values);

            send.created(res, "User Created Successfuly");
        }
    } catch (error) {
        send.internalError(res);
    }
};

export const Validate = async (req: Request, res: Response) => {
    send.ok(res); // sends ok if middleware validates the token 
};