import mongoose, { Schema } from "mongoose";
import User  from "./user.model.js";
import Tweet from './tweet.model.js' ;
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema({
  content: {
    type: String,
    maxLength: 250,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "USER",
    required: true,
  },
  tweet: {
    type: Schema.Types.ObjectId,
    ref: "Tweet",
    required: true,
  },
  parentComment: {
    //for nested replies
    type: Schema.Types.ObjectId,
    ref: "Comment",
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});


export const Comment = mongoose.model('Comment', likeSchema);