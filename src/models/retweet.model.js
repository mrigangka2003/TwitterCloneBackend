import mongoose, { Schema } from "mongoose";
import Tweet from "./tweet.model";

const reTweetSchema = new Schema({
  originalTweet: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Tweet",
  },
  retweetingUser: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  content: {
    type: String,
    maxlength: 280,
  },
});

export const ReTweet = mongoose.model("Retweet", reTweetSchema);
