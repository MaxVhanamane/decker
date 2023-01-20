import { ObjectId } from "mongoose"

export type UserDetails={
    _id?:ObjectId,
    username:string,
    email:string,
    profile_picture:string,
    password?:string,
    otp?:number
}
