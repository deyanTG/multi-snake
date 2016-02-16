/**
 * Created by Deyan on 27.12.2015 �..
 */
window.onload = function () {
    alert('Start a game?');

    var socket = io.connect('http://192.168.1.133:3000', {
        reconnection: false
    });

    var canvas = document.getElementById('mycanvas');
    window.addEventListener('keydown', doKeyDown, true);

    var ctx = canvas.getContext('2d');
    var direction = 0;

    socket.on("deadSnake", function (data) {

        var snake = data.snake;

        if (snake.statistics.eatItself) {
            alert('You ate yourself. Your score is ' + snake.statistics.score + '.\nYou killed ' + snake.statistics.killedSnakesCounter + ' snakes.\nPress f5 if you want to play again :)');
            return;
        }
        alert('Your score is ' + snake.statistics.score + '.\nYou killed ' + snake.statistics.killedSnakesCounter + ' snakes.\nPress f5 if you want to play again :)');

    });

    socket.on("update", function (data) {

        //we should clean it before redrawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var map = data.map;
        var snakes = data.snakes;
        var isCurrentSnake;

        var mySnake = getSnakeById(snakes, socket.id);

        //draw border and some text
        drawMain();

        // Start cycling the matrix
        for (var x = 0; x < map.length; x++) {
            for (var y = 0; y < map[0].length; y++) {
                if (map[x][y] === 1) {
                    ctx.fillStyle = 'red';
                    ctx.fillRect(x * 10, y * 10 , 10, 10);
                } else if (map[x][y] === 2) {

                    if (mySnake) {
                        isCurrentSnake = mySnake.body.some(function (bodyPart) {
                            return bodyPart.x === x && bodyPart.y === y;
                        });
                    }
                    if (isCurrentSnake) {
                        ctx.fillStyle = 'green';
                        ctx.fillRect(x * 10, y * 10 , 10, 10);
                    } else {
                        ctx.fillStyle = 'orange';
                        ctx.fillRect(x * 10, y * 10 , 10, 10);
                    }
                }
            }
        }

    });

    function doKeyDown(e) {
        if (e.keyCode === 38 && direction !== 3) {
            direction = 2; // Up
            socket.emit("update", {"socketID": socket.id, "direction": direction});
        } else if (e.keyCode === 40 && direction !== 2) {
            direction = 3; // Down
            socket.emit("update", {"socketID": socket.id, "direction": direction});
        } else if (e.keyCode === 37 && direction !== 0) {
            direction = 1; // Left
            socket.emit("update", {"socketID": socket.id, "direction": direction});
        } else if (e.keyCode === 39 && direction !== 1) {
            direction = 0; // Right
            socket.emit("update", {"socketID": socket.id, "direction": direction});
        }
    }


    function drawMain() {
        ctx.lineWidth = 2; // Our border will have a thickness of 2 pixels
        ctx.strokeStyle = 'black'; // The border will also be black

        // The border is drawn on the outside of the rectangle, so we'll
        // need to move it a bit to the right and up.
        ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

        ctx.fillStyle = 'black';
        ctx.font = '12px sans-serif';
    }

    function getSnakeById(snakes, id) {
        for (var i = 0; i < snakes.length; i++) {
            if (id === snakes[i].id.slice(2)) {
                return snakes[i];
            }
        }
    }
};

