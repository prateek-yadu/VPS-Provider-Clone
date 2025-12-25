import { Response } from "express"
const send = {
    /*
        ##----SUCCESS----##
    */
    ok(res: Response, message?: string, data?: any) {
        return res.status(200).json({
            status: 200,
            message: message ? message : "OK",
            ...(data && { data })
        })
    },
    created(res: Response, message?: string, data?: any) {
        return res.status(201).json({
            status: 201,
            message: message ? message : "Created",
            ...(data && { data })
        })
    },

    /*
       ##----CLIENT SIDE ERROR----##
   */
    badRequest(res: Response, message?: string, data?: any) {
        return res.status(400).json({
            status: 400,
            message: message ? message : "Bad Request",
            ...(data && { data })
        })
    },
    unauthorized(res: Response, message?: string, data?: any) {
        return res.status(401).json({
            status: 401,
            message: message ? message : "Unauthorized",
            ...(data && { data })
        })
    },
    forbidden(res: Response, message?: string, data?: any) {
        return res.status(403).json({
            status: 403,
            message: message ? message : "Forbidden",
            ...(data && { data })
        })
    },
    notFound(res: Response, message?: string, data?: any) {
        return res.status(404).json({
            status: 404,
            message: message ? message : "Not Found",
            ...(data && { data })
        })
    },
    conflict(res: Response, message?: string, data?: any) {
        return res.status(409).json({
            status: 409,
            message: message ? message : "Conflict",
            ...(data && { data })
        })
    },

    /*
       ##----SERVER SIDE ERROR----##
   */
    internalError(res: Response, message?: string, data?: any) {
        return res.status(500).json({
            status: 500,
            message: message ? message : "Internal Server Error",
            ...(data && { data })
        })
    },
}



export default send