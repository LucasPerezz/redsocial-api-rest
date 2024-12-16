import { Schema, model } from "mongoose";


const PublicationSchema = new Schema({
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    },
    text: {
        type: String,
        required: true
    },
    file: String,
    created_at: {
        type: Date,
        default: Date.now()
    }
})

export const publicationModel = model('Publication', PublicationSchema);

