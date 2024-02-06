import { NextFunction, Request, Response } from "express";
export declare const fetchUserDetails: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
