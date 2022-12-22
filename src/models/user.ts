import mongoose  from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  username:  { type: String,required:true}, 
  email:{type:String,unique:true,required:true},
  profile_picture:{type:String},
  password:{type:String,required:false},
  
},{ timestamps: true });

const User = mongoose.model('User', UserSchema);

export default User
