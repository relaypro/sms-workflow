import twilio from 'twilio'
import SmsDB from '../schemas/SmsDB.js'
import parseNumber from 'phone'
import {eventEmitter} from '../index.js'
import dotenv from 'dotenv'
dotenv.config()

const accountSid = process.env.TWILIO_ACCOUNT_ID
const authToken = process.env.TWILIO_AUTH_TOKEN
const from_number = process.env.TWILIO_NUMBER

let to_number = null
let name = ''
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

const createApp = (relay) => {
    console.log("app is hosted and running")
    let message = '' 
    let new_message = true
    relay.on(`start`, async () => {
        let id = await relay.getDeviceId();
        console.log("The relay device ID is : " + id.toString());
        await SmsDB.findOne({user_id: id.toString()}, function(err, post){
            if (post !== null) {
                to_number = post.number
                name = post.name
            }
        })
        if (to_number === null) {
            await relay.say(`Who would you like to text?`)
            const get_number = await relay.listen(['$FULLPHONENUM'])
            to_number = get_number.text
            to_number = parseNumber(to_number, 'USA')
            let correct = false
            while (!correct) {
                if (to_number.length === 0) {
                    await relay.say("Phone number not recognized, please try again")
                    const get_number = await relay.listen(['$FULLPHONENUM'])
                    to_number = get_number.text
                    to_number = parseNumber(to_number, 'USA')
                } else {
                    correct = true
                }
            }
            to_number = to_number[0]
            console.log(`phone number is ${to_number}`)
            await relay.say(`What is ${to_number}'s name?`)
            name = await relay.listen(["iPhone", "Leena", "Ibraheem"])
            name = name.text
        }
        await relay.say(`Tap once to send ${name} a message. Double tap to exit`)
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
                await relay.say(`${name} responded with ${message}`)
                //to_number = null
                //await relay.terminate()
            } else if (button.taps === `triple`) {
                await send_text("Relay has ended the conversation", to_number)
                await relay.say(`Goodbye`)
                await SmsDB.findOneAndUpdate({number: to_number.toString()}, {deleted: true}, async function(err, post){
                    if (err) {
                        console.log("could not set flag to deleted for: " + to_number)
                    } else {
                        to_number = null
                        await relay.terminate()
                    }
                })
            }
        }
    })

    eventEmitter.on(`http_event`, async (text) => {
        console.log(`http_event received ${text}`)
        await relay.say(`${name} responded with ${text}`)
        message = text
        await relay.say(`Tap once to reply. Double tap to hear the message again`)
    })
}

export default createApp