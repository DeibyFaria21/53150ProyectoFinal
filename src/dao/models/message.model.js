import mongoose from "mongoose"

const messageCollection = "messages"

const messageSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        max: 15
    },
    message: {
        type: String,
        required: true,
        max: 150
    }
},
{ timestamps: true }
)

const messageModel = mongoose.model(messageCollection, messageSchema)

export default messageModel