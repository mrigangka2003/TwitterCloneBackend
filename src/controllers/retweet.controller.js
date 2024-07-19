import { Tweet } from "../models/tweet.model";
import { ReTweet } from "../models/retweet.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import {ApiResponse} from "../utils/ApiResponse"
import mongoose from "mongoose";

const createRetweet = asyncHandler(async(req,res)=>{
    const userId = req.user._id ;
    const {content} = req.body ;
    const {tweetId} = req.params ;
    try{
        const tweet = await Tweet.findById(tweetId) ;
        if(!tweet){
            throw new ApiError(400,"Tweet doesn't exists") ;
        }

        const retweet = new ReTweet({
            content:content||"",
            retweetingUser:userId,
            originalTweet : tweetId
        })
        
        await retweet.save() ;

        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                retweet,
                "ReTweeted Successfully"
            )
        )

    }catch(error){
        throw new ApiError(500,error.message || "Something went Wrong") ;
    }
})


export {
    createRetweet
}