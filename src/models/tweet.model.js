import mongoose, { Schema } from 'mongoose';
import User from './user.model.js';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const tweetSchema = new Schema({
    content: {
        type: String,
        required: true,
        maxLength: 280

    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    media: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    versionKey: false,
})

tweetSchema.plugin(mongooseAggregatePaginate) ;

export const Tweet = mongoose.model("Tweet", tweetSchema);
