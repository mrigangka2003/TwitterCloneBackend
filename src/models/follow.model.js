import mongoose, { Schema } from 'mongoose';

const followSchema = new Schema({
    follwer: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    followee: {
        type: Schema.Types.ObjectId,
        required: true,
        ref:'User'
    },
    status: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
})


export const followModel = mongoose.model(followModel, 'followSchema');
