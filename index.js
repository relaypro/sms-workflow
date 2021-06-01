import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { relay } from '@relaypro/sdk'
import twilio from './workflows/twilio.js'
import SmsDB from './schemas/SmsDB.js'
import parseNumber from 'phone'
import EventEmitter from 'events'
import alert2 from 'alert'

export const eventEmitter = new EventEmitter()    
const port = process.env.PORT || 3000
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const _server = express()
let id = null

_server.use(express.urlencoded({extended: true}))
_server.use(express.json())
_server.use(express.static(path.join(__dirname ,'index.html')))

_server.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'))
})

_server.get('/id/:id', function(req, res) {
    id = req.params.id
    res.sendFile(path.join(__dirname, '/noID.html'))
})

_server.get('/generate', function(req, res) {
    res.sendFile(path.join(__dirname, '/generate.html'))
})

_server.post('/generate', function(req, res) {
    let device_id = req.body.user_id
    let url = "relay-sms.herokuapp.com/id/" + device_id.toString()
    alert2(url)
    res.redirect("/generate")
})
_server.get('/main.js', function(req, res) {
    res.sendFile(path.join(__dirname, '/main.js'))
})

_server.get('/style.css', function(req, res) {
    res.sendFile(path.join(__dirname, '/style.css'))
})

_server.get('/logo.png', function(req, res) {
    res.sendFile(path.join(__dirname, '/logo.png'))
})

_server.post('/', function(req, res) {
    console.log("user number recieved: " + req.body.num1)
    console.log("name recieved: " + req.body.name)
    id = req.body.user_id ? req.body.user_id : id
    console.log(id)
    let number = parseNumber(req.body.num1, 'USA')
    if (number.length === 0) {
        alert2("Number not recognized, please try again")
        res.redirect('/')
    } else {
        console.log(number)
        const post = new SmsDB({
            name: req.body.name,
            user_id: id,
            number: req.body.num1
        })
        post.save(function(err){
            if (!err){
                res.sendFile(path.join(__dirname, '/recieved.html'))
            } else {
                console.log(err)
            }
        })
    }
})

_server.post('/msg', function(req, res) {
    let data = req.body.Body
    eventEmitter.emit(`http_event`, data)
    res.status(200)
})

const server = _server.listen(port, function() {
    console.log("Web server listening on port: " + port)
})

const app = relay({server})
app.workflow(`twilio`, twilio)