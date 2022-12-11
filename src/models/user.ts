import mongoose  from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  username:  { type: String,required:true}, 
  email:{type:String,unique:true,required:true},
  password:{type:String,required:false},
  
});

const User = mongoose.model('User', UserSchema);

export default User
