var http = require('http');
var express = require('express');
var app = express();
var io = require('socket.io')(http);
var cors = require('cors');
var Gpio = require('pigpio').Gpio,
    ledRed = new Gpio(4, { mode: Gpio.OUTPUT }),
    ledGreen = new Gpio(12, { mode: Gpio.OUTPUT }),
    ledBlue = new Gpio(26, { mode: Gpio.OUTPUT }),
    redRGB = 0,
    greenRGB = 0,
    blueRGB = 0;

ledRed.digitalWrite(0);
ledGreen.digitalWrite(0);
ledBlue.digitalWrite(0);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html')
});

app.get('/goiaba/message/', function (req, res) {
    res.send(String('message from node'));
});

app.get('*', function (req, res) {
    res.status(404).send('Unrecognised API call');
});

app.use(function (err, req, res, next) {
    if (req.xhr) {
        res.status(500).send('Oops, Something went wrong!');
    } else {
        next(err);
    }
});

io.sockets.on('connection', function (socket) {
    socket.on('rgbLed', function (data) {
        console.log(data); 
        redRGB = parseInt(data.red);
        greenRGB = parseInt(data.green);
        blueRGB = parseInt(data.blue);

        ledRed.pwmWrite(redRGB);
        ledGreen.pwmWrite(greenRGB);
        ledBlue.pwmWrite(blueRGB);
    });

    var lightvalue = 0;
    socket.on('light', function (data) {
        lightvalue = data;
        if (lightvalue != LED.readSync()) {
            LED.writeSync(lightvalue);
            console.log("lightvalue : " + lightvalue);
            socket.emit('light', lightvalue);
        }
    });
});

process.on('SIGINT', function () { 
    ledRed.digitalWrite(0);
    ledGreen.digitalWrite(0);
    ledBlue.digitalWrite(0);
    LED.writeSync(0);
    LED.unexport();
    process.exit();
});


app.use(cors).listen(5000, () => {
    console.log('server running 5000');
});