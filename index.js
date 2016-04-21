require('dotenv').config();

var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()

var phrases = ['yo momma!',
  'you do that in bed.',
  'would you like frogs with that?',
  'I love you too! Wait...I thought you were someone else.',
  'my dead grandpa just told me he found that joke funny.',
  "I got it from my Daddy, I got it from my Daddy! I feel nice, you look nice. You'll be my curry, I'll be your rice",
  'vass iss your problem? Ze Doktor iss IN!',
  "stop being so negative. I mean positive. I mean indecisive. Oh hell, I'll shut up now.",
  'I like big bots and I cannot lie.',
  "this is a story all about how my life got flipped-turned upside down and I'd like to take a minute, just sit right there, I'll tell you how I became the prince of a town called Bel-Air"]

app.set('port', (process.env.PORT || 5000))

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Process application/json
app.use(bodyParser.json())

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a chat bot')
})

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'my_voice_is_my_password_verify_me') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})

app.post('/webhook/', function (req, res) {
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        if (event.message && event.message.text) {
            text = event.message.text
            if (text === 'generic') {
                sendGenericMessage(sender)
                continue
            }
            j = Math.floor((Math.random() * 10)); // random # from 0-9
            sendTextMessage(sender, text.substring(0, 200) + '? Well, ' + phrases[j])
        }
        if (event.postback) {
            text = JSON.stringify(event.postback)
            sendTextMessage(sender, "Postback: " + text.substring(0, 200), token)
            continue
        }
    }
    res.sendStatus(200)
})

var token = process.env.FACEBOOK_TOKEN

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

function sendGenericMessage(sender) {
    messageData = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": "Raymond's Naps: Mobile App",
                    "subtitle": "Home screen",
                    "image_url": "https://raw.githubusercontent.com/rayning0/iPhone-Sample-App---iRise-Studio-MX/master/Screen%20Shot%201.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://raw.githubusercontent.com/rayning0/iPhone-Sample-App---iRise-Studio-MX/master/Screen%20Shot%201.png",
                        "title": "Home Image"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Log in, dude!",
                    }],
                }, {
                    "title": "Find Frogs Legs & Pork Chops",
                    "subtitle": "A joke",
                    "image_url": "https://raw.githubusercontent.com/rayning0/iPhone-Sample-App---iRise-Studio-MX/master/Screen%20Shot%204.png",
                    "buttons": [{
                        "type": "web_url",
                        "url": "https://raw.githubusercontent.com/rayning0/iPhone-Sample-App---iRise-Studio-MX/master/Screen%20Shot%204.png",
                        "title": "Frogs Legs and Pork Chops"
                    }, {
                        "type": "postback",
                        "title": "Postback",
                        "payload": "Would you like frogs with that burger?",
                    }],
                }]
            }
        }
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}