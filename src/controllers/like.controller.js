import mongoose from "mongoose";
import { Likes } from "../models/like.model";
import { User } from "../models/user.model";
import { Tweet } from "../models/tweet.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

const toggleTweetlike = asyncHandler(async (req, res) => {
    const { tweetID } = req.params;

    try {
        const tweet = await Tweet.findById(tweetID);
        const userId = req.user._id;

        if (!tweet || !userId) {
            throw new ApiError(500, "Unauthorized request");
        }

        const existingLike = await Likes.findOne({
            tweet: tweetID,
            likedBy: userId,
        });

        if (existingLike) {
            await Likes.findOneAndDelete(existingLike._id);
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        existingLike,
                        "Like Removed successfully"
                    )
                );
        } else {
            const like = new Likes({
                tweet: tweetID,
                likedBy: userId,
            });
        }

        await Likes.save();
        return res
            .status(200)
            .json(
                new ApiResponse(200, existingLike, "Like done successfully")
            );
    } catch (error) {
        throw new ApiError(401, "Something went Wrong");
    }
});


const getTweetLike = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;

    try {
        const likes = await Tweet.findOne(tweetId).populate('user' , 'username') ;

        return res
        .status(200)
        .json(
            new ApiResponse(200, likes, "Likes count")
        )

    } catch (error) {
        throw new ApiError(500,"Something went Wrong") ;
    }
});



export {
    toggleTweetlike,
    getTweetLike,
}