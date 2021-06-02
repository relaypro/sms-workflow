import mongoose from 'mongoose'

//const uri = process.env.MONGODB_URI
const uri = "mongodb+srv://relay-1:relayrelay@relaysms.svodb.mongodb.net/relaysms?retryWrites=true&w=majority"
mongoose.connect(uri, {useNewUrlParser: true})
const relayTwilioSchema = {
    name: String,
    user_id: String,
    number: String
}
const SmsDB = mongoose.model("relaysms", relayTwilioSchema)
export default SmsDB