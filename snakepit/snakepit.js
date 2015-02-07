var sp = {
    snakePit: undefined,
    spriteList: null,
    running: false,
    loopCounter: 0,
    snake: null,
    score: 0,
    snakeSegments: [],
    canvas: undefined,
    context: undefined,
    CANVAS_WIDTH: 640,
    CANVAS_HEIGHT: 480
};  // global variables

var jgl = undefined;

// ********************************************
var snakePit = function() {
    console.log("SNAKEPIT LAUNCHED");
    this.init();
    this.updateScreen();
}

// ********************************************
snakePit.prototype.init = function() {
    document.addEventListener('keydown', this.processKeyDown);

    sp.canvas = document.getElementById("canvas");
    sp.context = sp.canvas.getContext("2d");
    sp.context.fillStyle = "#116611";
    sp.context.fillRect(0, 0, sp.CANVAS_WIDTH, sp.CANVAS_WIDTH);

    jgl = new Jgl;
    sp.spriteList = new Jgl_SpriteList(jgl);

    sp.snake = sp.spriteList.newSprite({id: 'snake', width: 32, height: 32, imageUrl: './redball32x32.png'});
    sp.snake.setHotSpot(16, 16);
    sp.snake.x = jgl.randomRange(5,15) * 32 - 16;
    sp.snake.y = jgl.randomRange(4,11) * 32 - 16;;
    sp.snake.user.dx = 0;
    sp.snake.user.dy = 0;
    sp.snake.user.pendingDx = 0;
    sp.snake.user.pendingDy = 0;
}

snakePit.prototype.processKeyDown = function(ev) {
    ev.preventDefault();

    switch (event.keyCode) {
        case jgl.KEYS.LEFT:
            sp.snake.user.pendingDx = -2;
            sp.snake.user.pendingDy = 0;
            break;

        case jgl.KEYS.RIGHT:
            sp.snake.user.pendingDx = +2;
            sp.snake.user.pendingDy = 0;
            break;

        case jgl.KEYS.UP:
            sp.snake.user.pendingDy = -2;
            sp.snake.user.pendingDx = 0;
            break;

        case jgl.KEYS.DOWN:
            sp.snake.user.pendingDy = +2;
            sp.snake.user.pendingDx = 0;
            break;

        case jgl.KEYS.ESC:
            sp.snake.user.dx = 0;
            sp.snake.user.dy = 0;
            sp.snake.user.pendingDy = 0;
            sp.snake.user.pendingDx = 0;
            sendMessage("QUIT");
            break;

        default:
            consumed = false;
            break;
    }
}

// ********************************************
snakePit.prototype.updateSnake = function() {

    if (++sp.loopCounter == 16) {
        sp.snake.user.dx = sp.snake.user.pendingDx;
        sp.snake.user.dy = sp.snake.user.pendingDy;
        sp.loopCounter = 0;
    }

    sp.snake.x += sp.snake.user.dx;
    sp.snake.y += sp.snake.user.dy;

    if ((sp.snake.x > (sp.CANVAS_WIDTH - 16) || sp.snake.x < 16) ||
        (sp.snake.y > (sp.CANVAS_HEIGHT - 16) || sp.snake.y < 16)) {
        sp.snake.x -= sp.snake.user.dx;
        sp.snake.y -= sp.snake.user.dy;
        sp.snake.user.dx = 0;
        sp.snake.user.dy = 0;
        sp.snake.user.pendingDx = 0;
        sp.snake.user.pendingDy = 0;
    }

    sp.snakeSegments.unshift({x: sp.snake.x, y:sp.snake.y});
    if (sp.snakeSegments.length > 199) {
        var erasePos = sp.snakeSegments.pop();
        sp.context.fillRect(erasePos.x - 16, erasePos.y - 16, 32, 32);
    }
}

// ********************************************
snakePit.prototype.updateScreen = function() {
    this.updateSnake();

    //sp.context.fillRect(0, 0, g.SCREEN_WIDTH, g.SCREEN_HEIGHT);
    sp.spriteList.drawSprites(sp.context);

    if (sp.running) {
        window.requestAnimFrame(this.updateScreen.bind(this));
    }
}

// ***************************************************
// MUST SUPPLY THIS COMMUNICATION INTERFACE TO
// SEND/RECEIVE MESSAGES FROM OUR PARENT
// ***************************************************

function sendMessage(str) {
    console.log("SP POSTING: " + str);
    window.top.postMessage(str, '*');
}

window.addEventListener('message', function(e){
    console.log("SP MESSAGE: " + e.data);
    switch (e.data) {
        case    'START':
            sp.running = true;
            sp.snakePit = new snakePit();
            break;

        case    'STOP':
            sp.running = false;
            delete (sp.snakePit);
            break;
    }
});

// TELL AGM THAT WE'RE READY TO RUN
sendMessage('READY');

