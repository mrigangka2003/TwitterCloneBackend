import mongoose, { Schema } from 'mongoose';


const likeSchema = new Schema({
    tweet: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Tweet'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    comment:{
        type :Schema.Types.ObjectId,
        ref:"Comment"
    },
    retweet:{
        type: Schema.Types.ObjectId,
        ref: "reTweet"
    },
    likedBy :{
        type: Schema.Types.ObjectId,
        ref:"User"
    }
}, {
    timestamps: true
})

export const Likes = mongoose.model('Likes', likeSchema);