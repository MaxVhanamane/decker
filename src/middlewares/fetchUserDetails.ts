import { NextFunction, Request, Response } from "express"

// middleware to get user details
export const fetchUserDetails = async function (req: Request, res: Response, next: NextFunction) {
    if (req?.isAuthenticated()) {

        next()
    }
    else {
        return res.status(401).json({ message: "Your session has expired. Please log in again to continue." })
    }

}
