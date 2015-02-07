window.addEventListener("load", agmMain, false);

var jgl = null;

var agm = {
    stateManager: null,
    states: [],
    iFrame: undefined
};  // global variables

// ****************************************************
function agmMain () {
    document.addEventListener('keydown', handleEvent);
    window.addEventListener('resize', resizeUi);
    jgl = new Jgl;
    resizeUi();

    agm.iFrame = document.getElementById('gamePort');
    // Create the state machine and initialise it to a given state
    agm.stateManager = jgl.newStateManager();
    agm.states[0] = agm.stateManager.registerState(new AgmSplashState("AgmSplash"));
    agm.states[1] = agm.stateManager.registerState(new SnakePitState("SnakePit"));
    agm.stateManager.transitionTo("SnakePit");
}

// ****************************************************
// These two functions are how we communicated with
// the application running in the iframe
// ****************************************************
function sendMessage(str) {
    console.log("AGM POSTING: " + str);
    if (agm.iFrame) {
        agm.iFrame.contentWindow.postMessage(str, '*');
    }
}

window.addEventListener('message', function(e){
    console.log("AGM MESSAGE: " + e.data);
    switch (e.data) {
        case    'READY':
            sendMessage("START");
            break;

        case    'QUIT':
            agm.stateManager.transitionTo('AgmSplash');
            break;
    }
});

// ****************************************************

function resizeUi() {
    jgl.centerElement('playfield');
    jgl.centerElement('gamePort');
}

// ****************************************************
function handleEvent(event) {
    var eventConsumed = false;
    event.preventDefault();
    var eventHandler = agm.stateManager.getCurrentStateEventHandler();
    if (eventHandler) {
        eventConsumed = eventHandler(event);
    }
    if (!eventConsumed) {
        console.log("Event was not handled by any State");
        switch (event.keyCode) {
            case jgl.KEYS.ESC:
                agm.stateManager.transitionTo('AgmSplash');
                break;
        }
    }
}

// ********************************************
var AgmSplashState = function(id) {
    this.id = id;
}

// Inherit from JGLs abstracted State class
AgmSplashState.prototype = Object.create(Jgl_State.prototype);

AgmSplashState.prototype.eventHandler = function(event) {
    var consumed = true;
    switch (event.keyCode) {
        case jgl.KEYS.ENTER:
            agm.stateManager.transitionTo("SnakePit");
            break;
        default:
            consumed = false;
            break;
    }
    return consumed;
};

AgmSplashState.prototype.enter = function(stateData) {
    console.log(this.id + " - ENTER");
    // Activate our screen
    jgl.createElement({
        parent: 'playfield',
        id:'agmSplash'
    });
    jgl.centerElement('agmSplash', 'both');
};

AgmSplashState.prototype.exit = function() {
    console.log(this.id + " - EXIT");
    // Deactivate our screen
    jgl.removeElement('agmSplash');
};


// ********************************************
var SnakePitState = function(id) { this.id = id; }

// Inherit from JGLs abstracted State class
SnakePitState.prototype = Object.create(Jgl_State.prototype);

SnakePitState.prototype.enter = function(stateData) {
    console.log(this.id + " - ENTER");
    agm.iFrame.src = './snakepit/snakepit.html';
    agm.iFrame.contentWindow.focus();
};

SnakePitState.prototype.exit = function() {
    console.log(this.id + " - EXIT");
    window.focus();
};
