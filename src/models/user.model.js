import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken' ;
import bcrypt from 'bcrypt' ;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "password is must"],
    },
    fullName: {
      type: String,
      required: true,
      maxlength: 100,
      trim: true
    },
    dateOfBirth:{
      type: Date,
    },
    likedTweets:[
      {
        type:Schema.Types.ObjectId
      }
    ],
    dateOfJoining: {
      type: Date,
    },
    bio: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true
    },
    dp: {
      type: String,
    },
    coverPhoto: {
      type: String,
    },
    bio: {
      type: String,
    },
    refreshToken: {
      type:String
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save" , async function(next){

  if(!this.isModified('password')) return next() ;
  this.password = await bcrypt.hash(this.password,12) ;
  next() ;
})


userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password , this.password) ;
}

userSchema.methods.generateAccessToken = function(){
  return jwt.sign({
    _id : this._id ,
    email: this.email ,
    fullName: this.fullName ,
    username : this.username
  },
    process.env.ACCESS_TOKEN_SECRET,{
      expiresIn : String(process.env.ACCESS_TOKEN_EXPIRY)
    }
  )
}

userSchema.methods.generateRefreshToken = function(){
  return jwt.sign({
    _id: this._id 
  },
  process.env.REFRESH_TOKEN_SECRET,{
    expiresIn: String(process.env.REFRESH_TOKEN_EXPIRY)
  }
)
}

export const User = mongoose.model("User", userSchema);