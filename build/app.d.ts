import { UserDetails } from "./types/UserDetails";
declare global {
    namespace Express {
        interface Request {
            userDetails: UserDetails | null;
        }
        interface User {
            email: string;
            profile_picture?: string | undefined | null;
            username: string;
        }
    }
}
