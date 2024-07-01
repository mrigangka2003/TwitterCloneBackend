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

        const user = await User.findById(decodedToken._id);

        if (!user) {
            throw new ApiError(401, "Invalid refresh Token");
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used");
        }

        const options = {
            httpOnly: true,
            secure: true,
        };

        const { accessToken, newRefreshToken } =
            await generateAccessAndRefereshTokens(user._id);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken,
                    },
                    "Access Token refreshed"
                )
            );
    } catch (error) {
        throw new ApiError(401, error?.message || "INVALID REFRESH TOKEN");
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confPassword } = req.body;

    if (!oldPassword || !newPassword || !confPassword) {
        throw new ApiError(401, "Invalid Request");
    }

    if (newPassword !== confPassword) {
        throw new ApiError(
            403,
            "New Password and confirm password doesn't match"
        );
    }

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old password");
    }

    user.password = newPassword;

    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed Succesfully !"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "CURRENT USER FETCHED SUCCESSFULLY ")
        );
});

const updateUserDetails = asyncHandler(async (req, res) => {
    const { fullName, email, bio } = req.body;

    if (!fullName && !email && !bio) {
        throw new ApiError(401, "Fields are required to make the changes");
    }

    const updateFields = {};
    if (fullName) updateFields.fullName = fullName;
    if (email) updateFields.email = email;
    if (bio) updateFields.bio = bio;

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: updateFields,
        },
        {
            new: true,
        }
    ).select("-password");

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "Accounts details updated succesfully ")
        );
});

const updateUserDp = asyncHandler(async (req, res) => {
    const dpLocalPath = req.file?.path;

    if (!dpLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    //have to delete image from cloudinary

    const dp = await uploadOnCloudinary(dpLocalPath);

    if (!dp.url) {
        throw new ApiError(400, "Error while uploading on avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                dp: dp.url,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Profile image updated successfully"));
});

const updateUserCoverPhoto = asyncHandler(async (req, res) => {
    const coverPhotoLocalPath = req.file?.path;

    if (!coverPhotoLocalPath) {
        throw new ApiError(400, "Cover photo file is missing");
    }

    //have to delete image from cloudinary

    const coverPhoto = await uploadOnCloudinary(coverPhotoLocalPath);

    if (!coverPhoto.url) {
        throw new ApiError(400, "Error while uploading on avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverPhoto: coverPhoto.url,
            },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover Photo updated successfully"));
});

const getUserProfile = asyncHandler(async (req, res) => {
    
    const { username } = req.params;

    if (!username?.trim()) {
        throw new ApiError(400, "User Name is Missing");
    }

    const profile = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: "follows",
                localField: "_id",
                foreignField: "followee",
                as: "followers",
            },
        },
        {
            $lookup: {
                from: "follows",
                localField: "_id",
                foreignField: "follower",
                as: "followedTo",
            },
        },
        {
            $addFields: {
                $followersCount: {
                    $size: "$followers",
                },
                followedCount: {
                    $size: "$followedTo",
                },
                isSubcribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$followers.followers"] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                followersCount: 1,
                followedCount: 1,
                isSubcribed,
                dp,
                coverPhoto,
            },
        },
    ]);

    if (!profile?.length) {
        throw new ApiError(404, "Channel doesn't exists");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                profile[0],
                "User channel fetched successfully!"
            )
        );
});

const getLikedTweets = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            },
        },
        {
            $lookup: {
                from: "tweets",
                localField: "likedTweets",
                foreignField: "_id",
                as: "likedTweets",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "createdBy",
                            foreignField: "_id",
                            as: "createdBy",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        dp: 1,
                                    },
                                },
                            ],
                        },
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner",
                            },
                        },
                    },
                ],
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].likedTweets,
                "Watch history fetched Successfully"
            )
        );
});





export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    updateUserDp,
    updateUserCoverPhoto,
    getUserProfile,
    getLikedTweets,
};
