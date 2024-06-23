import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileupload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullName, email, password, bio} = req.body;

  if (
    [fullName, email, username, password].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  //check the images
  const dpLocalPath = req.files?.dp[0]?.path;
  const coverLocalPath = req.files?.coverPhoto[0]?.path;

  if (!dpLocalPath) {
    throw new ApiError(400, " Dp file is required ");
  }

  //upload them to cloudinary
  const dp = await uploadOnCloudinary(dpLocalPath);

  if (!dp || !dp.url) {
    throw new ApiError(500, "Failed to upload Dp to Cloudinary");
  }

  const coverPhoto = await uploadOnCloudinary(coverLocalPath);

  if (!dpLocalPath) {
    throw new ApiError(400, " Dp file is required ");
  }

  const user =await User.create({
    fullName,
    dp: dp.url,
    email,
    coverPhoto: coverPhoto?.url || "",
    password,
    username: username.toLowerCase(),
    bio:bio?.trim() || "" 
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshtoken"
  )

  if(createdUser){
    throw new ApiError(500, "Something went wrong while registering the user");
  }


  return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered successfully")
  )

});

export { registerUser };
