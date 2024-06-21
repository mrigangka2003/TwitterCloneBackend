import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileupload.js";

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

  User.create({
    fullname,
    dp: dp.url,
    email,
    coverImage: coverImage?.url || "",
    password,
    username: username.toLowerCase(),
    bio:bio?.trim() || "" 
  });
});

export { registerUser };
