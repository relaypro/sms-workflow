import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const uri = process.env.MONGODB_URI
mongoose.connect(uri, {useNewUrlParser: true})
const relayTwilioSchema = {
    name: String,
    user_id: String,
    number: String,
    deleted: Boolean
}
const SmsDB = mongoose.model("relaysms", relayTwilioSchema)
export default SmsDB