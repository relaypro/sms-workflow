import { relay } from '@relaypro/sdk'
import twilio from 'twilio'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const accountSid = process.env.ACCOUNT_SID
const authToken = process.env.AUTH_TOKEN
const from_number = process.env.FROM_NUMBER
let to_number = ``
let name = ''
let user_id = ``

const port = process.env.PORT || 3000
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const express_app = express()
express_app.use(express.urlencoded({entended: true}))
express_app.use(express.json())
express_app.use(express.static(path.join(__dirname ,'index.html')))

express_app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'))
});

express_app.post('/', function(req, res) {
    to_number = req.body.num1
    user_id = req.body.user_id
    console.log("user number recieved: " + to_number)
    console.log("userID recieved: " + user_id)
    res.send("Received")
})

express_app.listen(port, function() {
    console.log("Web server listening on port: " + port)
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

const app = relay();
app.workflow(`twilio`, relay => {
    console.log("app is hosted and running")
    let message = ''
    //let stripped_number = relay.getVar(`number`)
    //let number = relay.getVar(`number`) 
    let new_message = true
    relay.on(`start`, async () => {
        if (to_number === ``) {
            await relay.say(`Who would you like to text?`)
            const get_number = await relay.listen()
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