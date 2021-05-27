import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { relay } from '@relaypro/sdk'
import twilio from './workflows/twilio.js'
import SmsDB from './schemas/SmsDB.js'
import parseNumber from 'phone'
import alert from 'alert'
    
const port = process.env.PORT || 3000
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const server = express()

server.use(express.urlencoded({extended: true}))
server.use(express.json())
server.use(express.static(path.join(__dirname ,'index.html')))

server.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'))
})

server.get('/main.js', function(req, res) {
    res.sendFile(path.join(__dirname, '/main.js'))
})

server.post('/', function(req, res) {
    console.log("user number recieved: " + req.body.num1)
    console.log("userID recieved: " + req.body.user_id)
    console.log("name recieved: " + req.body.name)

    let number = parseNumber(req.body.num1, 'USA')
    if (number.length === 0) {
        alert("Phone number not recognized, please try again")
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

server.post('/msg', function(req, res) {
    console.log(res.body)
    res.status(200).end()
})

server.listen(port, function() {
    console.log("Web server listening on port: " + port)
})

const app = relay()
app.workflow(`twilio`, twilio)