import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export class AppError extends Error {
    statusCode: number;
    status: string;
    isOperational: boolean;

    constructor(message: string, statusCode: number) {
        super(message);

        this.statusCode = statusCode;
        this.status = statusCode >= 500 ? "error" : "fail";
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Handle invalid MongoDB ObjectIds
    if (err instanceof mongoose.Error.CastError) {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    // Handle Mongoose validation errors
    if (err instanceof mongoose.Error.ValidationError) {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((error) => error.message)
            .join(", ");
    }

    // Handle duplicate MongoDB fields (for example, duplicate email)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0];
        message = field
            ? `${field} already exists`
            : "Duplicate value";
    }

    // Log the full error on the server
    console.error({
        message: err.message,
        stack: err.stack,
        method: req.method,
        path: req.originalUrl,
    });

    // Hide internal error details from clients in production
    if (statusCode >= 500 && process.env.NODE_ENV === "production") {
        message = "Internal Server Error";
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== "production" &&
            statusCode >= 500 && { stack: err.stack }),
    });
};
