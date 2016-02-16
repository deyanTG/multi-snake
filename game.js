/**
 * Created by Deyan on 15.1.2016 ã..
 */
//Snake constructor
var Snake = require('./snake.js');

var Game = function (io) {
    this.map = (function () {
        var map = new Array(50);
        for (var i = 0; i < map.length; i++) {
            map[i] = new Array(50);
        }
        return map;
    })();

    this.snakes = [];
    this.io = io;
};

Game.prototype.run = function () {
    var self = this;
    setInterval(function () {
        self.updateSnakes();
        self.io.emit("update", {map: self.map, snakes: self.snakes});
    }, 100);
};

Game.prototype.updateSnakes = function () {
    var self = this;
    this.snakes.forEach(function (snake) {
        snake.updateSnakeInGame(self);
    });
};

Game.prototype.generateSnakeOnMap = function (id) {
    var snake = new Snake(id);
    // Generate a random position for the row and the column of the head.
    var rndX = Math.round(Math.random() * 49),
        rndY = Math.round(Math.random() * 49);
    // Let's make sure that we're not out of bounds as we also need to make space to accommodate the
    // other two body pieces
    while ((rndX - snake.body.length) < 0) {
        rndX = Math.round(Math.random() * 49);
    }
    for (var i = 0; i < snake.body.length; i++) {
        snake.body[i] = {x: rndX - i, y: rndY};
        this.map[rndX - i][rndY] = 2;
    }
    this.snakes.push(snake);
    return snake;
};


Game.prototype.generateFoodOnMap = function () {
    // Generate a random position for the rows and the columns.
    var rndX = Math.round(Math.random() * 49),
        rndY = Math.round(Math.random() * 47);

        //rndY = 47;
    // We also need to watch so as to not place the food
    // on the a same matrix position occupied by a part of the
    // snake's body.
    while (this.map[rndX][rndY] === 2) {
        rndX = Math.round(Math.random() * 49);
        rndY = Math.round(Math.random() * 49);
    }
    this.map[rndX][rndY] = 1;
    return this.map;
};

Game.prototype.getSnakeById = function (id) {
    for (var i = 0; i < this.snakes.length; i++) {
        if (id === this.snakes[i].id) {
            return this.snakes[i];
        }
    }
    return null;
};

Game.prototype.killTheSnakeWithId = function (snakeToKill) {
    var self = this;
    for (var i = this.snakes.length - 1; i >= 0; i--) {
        if (this.snakes[i].id === snakeToKill.id) {
            var snake = this.snakes[i];
            this.snakes.splice(i, 1);
            snake.body.forEach(function (bodyPart) {
                //if a snake touches the wall than it is out of the field and we prevent
                if (bodyPart.x < 0 || bodyPart.x >= 50 || bodyPart.y < 0 || bodyPart.y >= 50) {
                    return;
                }
                self.map[bodyPart.x][bodyPart.y] = null;
            });
        }
    }
};

Game.prototype.sentSnakeStatistics = function (snake) {
    this.io.to(snake.id).emit("deadSnake", {snake: snake});
};

Game.prototype.getSnakeByBodyPartCoordinates = function (x, y) {
    return this.snakes.find(function (snake) {
        return snake.body.some(function (bodyPart) {
            return bodyPart.x === x && bodyPart.y === y;
        });
    });
};

Game.prototype.incrementKillerCounter = function (x, y) {
    var snake = this.getSnakeByBodyPartCoordinates(x, y);
    if (snake) {
        snake.statistics.killedSnakesCounter += 1;
    }
};

module.exports = Game;