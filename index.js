import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { relay } from '@relaypro/sdk'
import twilio from './workflows/twilio.js'
import SmsDB from './schemas/SmsDB.js'
import parseNumber from 'phone'
import alert from 'sweetalert2'
import EventEmitter from 'events'

export const eventEmitter = new EventEmitter()    
const port = process.env.PORT || 3000
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const _server = express()

_server.use(express.urlencoded({extended: true}))
_server.use(express.json())
_server.use(express.static(path.join(__dirname ,'index.html')))

_server.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'))
})

_server.get('/main.js', function(req, res) {
    res.sendFile(path.join(__dirname, '/main.js'))
})

_server.post('/', function(req, res) {
    console.log("user number recieved: " + req.body.num1)
    console.log("userID recieved: " + req.body.user_id)
    console.log("name recieved: " + req.body.name)

    let number = parseNumber(req.body.num1, 'USA')
    if (number.length === 0) {
        alert.fire("Number not recognized, please try again")
        res.redirect('/')
    } else {
        console.log(number)
        const post = new SmsDB({
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
    }
})

_server.post('/msg', function(req, res) {
    let data = req.body
    console.log(data)
    eventEmitter.emit(`http_event`, data)
    res.status(200)
})

const server = _server.listen(port, function() {
    console.log("Web server listening on port: " + port)
})

const app = relay({server})
app.workflow(`twilio`, twilio)