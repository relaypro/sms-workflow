import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import { relay } from '@relaypro/sdk'
import twilio from 'twilio'

const accountSid = `ACe5b6b3e01caea465fc78760921366664`
const authToken = `73e1c25155f536afda22da2f1a6ff7dc`
const from_number = `+19199449992`
let to_number = null
let name = ''
let user_id = ``

const uri = "mongodb+srv://relay-1:relayrelay@relaysms.svodb.mongodb.net/relaysms?retryWrites=true&w=majority"
mongoose.connect(uri, {useNewUrlParser: true})
const relayTwilioSchema = {
    name: String,
    user_id: String,
    number: String
}
const relayTwilio = mongoose.model("relaysms", relayTwilioSchema)

const port = process.env.PORT || 3000
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const server = express()
const INDEX = '/index.html'

server.use(express.urlencoded({extended: true}))
server.use(express.json())
server.use(express.static(path.join(__dirname ,'index.html')))
server.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'))
})
server.listen(port, function() {
    console.log("Web server listening on port: " + port)
})
server.post('/', function(req, res) {
    to_number = req.body.num1
    user_id = req.body.user_id
    name = req.body.name
    console.log("user number recieved: " + to_number)
    console.log("userID recieved: " + user_id)
    console.log("name recieved: " + name)

    const post = new relayTwilio({
        name: req.body.name,
        user_id: req.body.user_id,
        number: req.body.num1
    })
    
    
    post.save(function(err){
        if (!err){
            res.send("recieved")
        } else {
            console.log(err)
        }
    })
})


const client = new twilio(accountSid, authToken)
function send_text(message, to_number){
    console.log("WITHIN SEND TEXT FUNCTION")
    client.messages
        .create({
            body: message,
            from: from_number,
            to: to_number
            })
        .then(message => console.log(message.sid));
}
const app = relay({'server':server});
app.workflow(`twilio`, relay => {
    console.log("app is hosted and running")
    let message = ''
    //let stripped_number = relay.getVar(`number`)
    //let number = relay.getVar(`number`) 
    let new_message = true
    relay.on(`start`, async () => {
        let id = await relay.getDeviceId();
        console.log("The relay device ID is : " + id.toString());
        await relayTwilio.findOne({user_id: id.toString()}, function(err, post){
            console.log(post)
            if (post !== null) {
                console.log(post)
                to_number = post.number
                name = post.name
            }
        })
        console.log(to_number)
        if (to_number === null) {
            await relay.say(`Who would you like to text?`)
            const get_number = await relay.listen(['$FULLPHONENUM'])
            console.log(get_number)
            number = get_number.text
            //stripped_number = number.replace(/-/g,"")
            console.log(`phone number is ${number}`)
            await relay.say(`What is ${number}'s name?`)
            name = await relay.listen(["iPhone", "Leena", "Ibraheem"])
            //name = get_number
        }
        await relay.say(`Tap once to send ${name} a message. Double tap to exit`)
        //wfs[`+1${stripped_number}`] = relay
        //wfs[`+16788107545`] = relay
    })

    relay.on(`button`, async (button, taps) => {
        console.log("button clicked")
        console.log(button)
        if (button.button === `action`) {
            console.log("action button")
            if (button.taps === `single`) {
                if ( new_message ) {
                    new_message = false
                    await relay.say(`Press and hold to record your message`)
                    message = await relay.listen()
                    console.log(message)
                    await relay.say(`Message is: ${message.text}`)
                    await relay.say(`Tap once to send. Double tap to exit`)
                } else if ( !new_message ) {
                    new_message = true
                    console.log(`Sending to: ${to_number}`)
                    await send_text(message.text, to_number)
                    await relay.say(`Message sent.`)
                    message = ''
                }
            } else if (button.taps === `double`) { 
                await relay.say(`Goodbye`)
                await send_text(`+1${stripped_number}`, `Relay+ has ended the conversation`)
                await relay.terminate()
            }
        }
    })
})