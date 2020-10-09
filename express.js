var http = require('http');
var express = require('express');
var app = express();

var Gpio = require('pigpio').Gpio, //include pigpio to interact with the GPIO
    ledRed = new Gpio(4, { mode: Gpio.OUTPUT }), //use GPIO pin 4 as output for RED
    ledGreen = new Gpio(12, { mode: Gpio.OUTPUT }), //use GPIO pin 17 as output for GREEN
    ledBlue = new Gpio(26, { mode: Gpio.OUTPUT }), //use GPIO pin 27 as output for BLUE
    redRGB = 0, //set starting value of RED variable to off (0 for common cathode)
    greenRGB = 0, //set starting value of GREEN variable to off (0 for common cathode)
    blueRGB = 0; //set starting value of BLUE variable to off (0 for common cathode)

//RESET RGB LED
ledRed.digitalWrite(0); // Turn RED LED off
ledGreen.digitalWrite(0); // Turn GREEN LED off
ledBlue.digitalWrite(0); // Turn BLUE LED off

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html')
  });

app.get('/node/core/voltage/', function (req, res) {
    res.send(String(volts));
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

io.sockets.on('connection', function (socket) {// Web Socket Connection
    socket.on('rgbLed', function (data) { //get light switch status from client
        console.log(data); //output data from WebSocket connection to console

        //for common cathode RGB LED 0 is fully off, and 255 is fully on
        redRGB = parseInt(data.red);
        greenRGB = parseInt(data.green);
        blueRGB = parseInt(data.blue);

        ledRed.pwmWrite(redRGB); //set RED LED to specified value
        ledGreen.pwmWrite(greenRGB); //set GREEN LED to specified value
        ledBlue.pwmWrite(blueRGB); //set BLUE LED to specified value
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

process.on('SIGINT', function () { //on ctrl+c
    ledRed.digitalWrite(0); // Turn RED LED off
    ledGreen.digitalWrite(0); // Turn GREEN LED off
    ledBlue.digitalWrite(0); // Turn BLUE LED off
    LED.writeSync(0); // Turn LED off
    LED.unexport(); // Unexport LED GPIO to free resources
    process.exit(); //exit completely
});


app.listen(5000, () => {
    console.log('server running 5000');
});