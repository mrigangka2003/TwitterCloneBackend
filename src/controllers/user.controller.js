import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/fileupload.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.error("error ", error);
        throw new ApiError(
            500,
            "Something went wrong while generating referesh and access token"
        );
    }
};

const registerUser = asyncHandler(async (req, res) => {
    const { username, fullName, email, password, bio } = req.body;

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

    let coverPhotoLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverPhoto) &&
        req.files.coverPhoto.length > 0
    ) {
        coverPhotoLocalPath = req.files.coverPhoto[0].path;
    }

    if (!dpLocalPath) {
        throw new ApiError(400, " Dp file is required ");
    }

    //upload them to cloudinary
    const dp = await uploadOnCloudinary(dpLocalPath);

    const coverPhoto = await uploadOnCloudinary(coverLocalPath);

    if (!dp) {
        throw new ApiError(400, " Dp file is required ");
    }

    const user = await User.create({
        fullName,
        dp: dp.url,
        email,
        coverPhoto: coverPhoto?.url || "",
        password,
        username: username.toLowerCase(),
        bio: bio?.trim() || "",
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshtoken"
    );

    if (!createdUser) {
        throw new ApiError(
            500,
            "Something went wrong while registering the user"
        );
    }

    return res
        .status(201)
        .json(
            new ApiResponse(200, createdUser, "User registered successfully")
        );
});

const loginUser = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username && email is required!");
    }

    const user = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!user) {
        throw new ApiError(401, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken, //good practice
                    refreshToken, //good practice
                },
                "User logged In Successfully"
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            },
        },
        {
            new: true,
        }
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User LoggedOut"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );
    
        const user = await User.findById(decodedToken._id) ;
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh Token");
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh Token is expired or used") ;
        }
    
    
        const options = {
            httpOnly : true ,
            secure : true
        }
    
        const {accessToken , newRefreshToken} = await generateAccessAndRefereshTokens(user._id) ;
        
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken, 
                    refreshToken : newRefreshToken,
                },
                "Access Token refreshed"
            )
        )
    } catch (error) {
        throw  new ApiError(401,error?.message || "INVALID REFRESH TOKEN")
    }

});

export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken 
};
