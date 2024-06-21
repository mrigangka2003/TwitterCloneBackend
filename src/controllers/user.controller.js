import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileupload.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, fullname, email, password, bio} = req.body;

  if (
    [fullname, email, username, password].some(
      (fields) => fields?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  //check the images
  const dpLocalPath = req.files?.dp[0]?.path;
  const coverLocalPath = req.files?.cover[0]?.path;

  if (!dpLocalPath) {
    throw new ApiError(400, " Dp file is required ");
  }

  //upload them to cloudinary
  const dp = await uploadOnCloudinary(dpLocalPath);
  const coverImage = await uploadOnCloudinary(coverLocalPath);

  if (!dpLocalPath) {
    throw new ApiError(400, " Dp file is required ");
  }

  const user = User.create({
    fullname,
    dp: dp.url,
    email,
    coverImage: coverImage?.url || "",
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
