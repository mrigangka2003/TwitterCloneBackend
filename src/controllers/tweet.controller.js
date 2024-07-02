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

const editTweet = asyncHandler(async (req, res) => {
    const { tweetID } = req.params;
    const userId = req.user._id;
    const { content } = req.body;

    try {
        const tweet = await Tweet.findById(tweetID);
        if (!tweet) {
            throw new ApiError(404, "Tweet not found");
        }

        if (tweet.createdBy.toString() !== userId.toString()) {
            throw new ApiError(401, "Unauthorized access");
        }

        tweet.content = content?.trim() || "";
        await tweet.save({ ValidateBeforeSave: false });

        return res
            .status(200)
            .json(new ApiResponse(200, tweet, "Tweet Edited Successfully !"));
    } catch (error) {
        throw new ApiError(400, "Something Wrong while Editting tweet");
    }
});

const deleteTweet =  asyncHandler(async(req,res)=>{

})

const getAllTweet = asyncHandler(async(req,res)=>{
    
})

export { 
    createTweet,
    editTweet,
    deleteTweet,
    getAllTweet

};
