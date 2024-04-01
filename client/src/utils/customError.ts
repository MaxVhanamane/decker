// Define an interface named CustomErrorProps with a property statusCode of type number
interface CustomErrorProps {
    statusCode: number;
}

// Define a class named CustomError that extends the built-in Error class and implements the CustomErrorProps interface
export class CustomError extends Error implements CustomErrorProps {
    // Define a property statusCode of type number in the class
    statusCode: number;

    // Constructor that takes a message of type string and a statusCode of type number
    constructor(message: string, statusCode: number) {
        // Call the constructor of the base Error class with the provided message
        super(message);

        // Set the statusCode property with the provided statusCode
        this.statusCode = statusCode;
    }
}
