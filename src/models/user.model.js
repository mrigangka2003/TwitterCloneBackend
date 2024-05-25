import mongoose, { Schema } from "mongoose";

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
    name: {
      type: String,
      required: true,
      index: true,
      trim: true,
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
    firstName: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      maxlength: 50,
      trim: true
    },
    dateOfBirth:{
      type: Date,
    },
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
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model("User", userSchema);
