/**
 * Created by Deyan on 2.1.2016 �..
 */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Game = require('./game.js');

var gameport = 3000;

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/snake.html');
});

http.listen(gameport, function () {
    console.log('listening on *:3000');
});

var g = new Game(io);
g.generateFoodOnMap();
g.run();

io.sockets.on('connection', function (socket) {
    console.log("a snake has connected: " + socket.id);
    var connectedSnake = g.generateSnakeOnMap(socket.id);
    socket.on("disconnect", function () {
        console.log("a client has disconnected: " + socket.id);
        g.killTheSnakeWithId(connectedSnake);
    });
    socket.on("update", function (data) {
        var snake = g.getSnakeById(socket.id);
        if (snake) {
            if ((data.direction === 2 && snake.direction !== 3) || (data.direction === 3 && snake.direction !== 2) || (data.direction === 1 && snake.direction !== 0) || (data.direction === 0 && snake.direction !== 1)) {
                //here is important to use setTimeout because direction validation may be discarded !!!
                setTimeout(function () {
                    snake.direction = data.direction;
                }, 100);
            }
        }
    });
});