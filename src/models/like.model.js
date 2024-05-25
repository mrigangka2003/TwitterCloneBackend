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
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

export const Likes = mongoose.model('Likes', likeSchema);