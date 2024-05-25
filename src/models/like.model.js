import mongoose, { Schema } from 'mongoose';


const likeSchema = new Schema({
    tweetId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Tweet'
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },

}, {
    timestamps: true
})

export const Likes = mongoose.model('Likes', likeSchema);