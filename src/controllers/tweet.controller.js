import { Tweet } from "../models/tweet.model";
import { User } from "../models/user.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { uploadOnCloudinary } from "../utils/fileupload";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const userId = req.user._id;

    if (!content?.trim()) {
        throw new ApiError(401, "content or message is required !");
    }

    let mediaUrl = "";
    if (req.file) {
        try {
            const uploadedMedia = await uploadOnCloudinary(req.file.path);
            mediaUrl = uploadedMedia.url;
        } catch (error) {
            console.error("Error uploading media:", error);
            throw new ApiError(
                500,
                "Error uploading tweet media. Please try again."
            );
        }
    }

    try {
        const tweet = new Tweet({
            content,
            createdBy: userId,
            media: media?.url || "",
        });

        await tweet.save();
        return res
            .status(200)
            .json(
                new ApiResponse(200, tweet, "You have successfully tweeted !")
            );
    } catch (error) {
        throw new ApiError(
            500,
            "Error uploading tweet media. Please try again"
        );
    }
});

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    try {
        const tweet = await Tweet.findOneAndUpdate(
            {
                _id: tweetId,
                createdBy: userId,
            },
            {
                $set: {
                    content: content?.trim() || "",
                },
            },
            {
                new: true,
            }
        );

        if (!tweet) {
            throw new ApiError(404, "Tweet not found");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, tweet, "Tweet Edited Successfully !"));
    } catch (error) {
        throw ApiError(500, error.message || "Failed to Update");
    }
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetID } = req.params;
    const userId = req.user._id;
    try {
        const tweet = await Tweet.findOneAndDelete({
            _id: tweetId,
            createdBy: userId,
        });

        if (!tweet) {
            throw new ApiError(404, "Tweet Not found");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, {}, "Tweet Deleted Successfully !"));
    } catch (error) {
        throw new ApiError(
            500,
            error.message || "Unable to delete Tweet try again later !"
        );
    }
});

const getAllTweet = asyncHandler(async (req, res) => {
});

export { createTweet, updateTweet, deleteTweet, getAllTweet };
