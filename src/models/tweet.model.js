import mongoose, { Schema } from 'mongoose';
import User from './user.model.js';



const tweetSchema = new Schema({
    content: {
        type: String,
        required: true,
        maxLength: 250

    },
    createdBy: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    imageUrl: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false,
})

export const Tweet = mongoose.model("Tweet", tweetSchema);
