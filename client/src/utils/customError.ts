interface CustomErrorProps {
    statusCode: number;
}

export class CustomError extends Error implements CustomErrorProps {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
    }
}
