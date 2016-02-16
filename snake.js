var Snake = function (id) {
    this.id = id;
    this.body = new Array(3);
    this.direction = 0;
    this.active = true;
    this.statistics = {score: 0, killedSnakesCounter: 0, eatItself: false};
};

Snake.prototype.gameOver = function (game) {
    this.active = false;
    game.sentSnakeStatistics(this);
    game.killTheSnakeWithId(this);
};

Snake.prototype.eatItself = function (x, y) {
    return this.body.some(function (bodyPart) {
        return bodyPart.x === x && bodyPart.y === y;
    });
};

// Remember that when they move, the body pieces move to the place
// where the previous piece used to be. If it's the last piece, it
// also needs to clear the last position from the matrix
Snake.prototype.makeTailMove = function (game, i) {
    var map = game.map;
    if (i === (this.body.length - 1)) {
        map[this.body[i].x][this.body[i].y] = null;
    }
    this.body[i] = {x: this.body[i - 1].x, y: this.body[i - 1].y};
    map[this.body[i].x][this.body[i].y] = 2;
};

Snake.prototype.validateHeadMove = function (game, x1, y1) {
    var map = game.map;
    if (x1 < 0 || x1 >= 50 || y1 < 0 || y1 >= 50) {
        this.gameOver(game);
        return false;
    }
    // Detect if we hit food and increase the score if we do,
    // generating a new food position in the process, and also
    // adding a new element to the snake array.
    if (map[x1][y1] === 1) {
        this.body[0] = {x: x1, y: y1};
        this.statistics.score += 1;
        game.generateFoodOnMap();
        // Add a new body piece to the array
        this.body.push({x: this.body[this.body.length - 1].x, y: this.body[this.body.length - 1].y});
    } else if (map[x1][y1] === 2) {
        //if(this.body[0].x === this.body[1].x && this.body[0].y === this.body[1].y){
        //    return false;
        //}
        //and if this is not our body
        if (this.eatItself(x1, y1)) {
            this.statistics.eatItself = true;
        } else {
            game.incrementKillerCounter(x1, y1);
        }
        this.gameOver(game)
        return false;
    } else if (!map[x1][y1]) {
        this.body[0] = {x: x1, y: y1};
    }
    map[x1][y1] = 2;
    return true;
};

Snake.prototype.makeHeadMove = function (game) {
    var x1, y1;
    switch (this.direction) {
        case 2:
            x1 = this.body[0].x;
            y1 = this.body[0].y - 1;
            break;
        case 3:
            x1 = this.body[0].x;
            y1 = this.body[0].y + 1;
            break;
        case 1 :
            x1 = this.body[0].x - 1;
            y1 = this.body[0].y;
            break;
        case 0 :
            x1 = this.body[0].x + 1;
            y1 = this.body[0].y;
            break;
    }
    this.validateHeadMove(game, x1, y1);
};

Snake.prototype.updateSnakeInGame = function (game) {
    if (!this.active) {
        return;
    }
    for (var i = this.body.length - 1; i >= 0; i--) {
        // I am only going to perform the collision detection using the head
        // so it will be handled differently than the rest of its body
        if (i === 0) {
            this.makeHeadMove(game);
        } else {
            this.makeTailMove(game, i);
        }
    }
};

module.exports = Snake;