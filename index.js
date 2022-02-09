//projectiles.forEach(((a, b) =>{}))

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modalEl');
const bigScoreEl = document.querySelector('#bigScoreEl');

class Player {
    constructor(id, x, y, radius, color) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }
}

class Subject{}
class Observers{}


let players = [];

let animationId;
let score = 0;

const game = createGame()
const keyboardListener = createKeyboardListener()
keyboardListener.subscribe(game.movePlayer)


function renderScreen() {
    animationId = requestAnimationFrame(renderScreen)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0,0, canvas.width, canvas.height)
    
    for(player in game.state.players){
        game.state.players[player].draw()
    }
}

function createKeyboardListener(){
    const state = {
        observers: []
    }

    function subscribe(observerFunction){
        state.observers.push(observerFunction)
    }

    function notifyAll(command){
        console.log(`notificando ${state.observers.length} observers`)

        for (const observerFunction of state.observers){
            observerFunction(command)
        }
    }

    document.addEventListener('keydown', handleKeydown)

    function handleKeydown(event){
        const keyPressed = event.key
    
        const command = {
            playerId: 'player1',
            keyPressed
        }
    
        notifyAll(command)
    }

    return {subscribe}
}

function createGame(){

    const y = canvas.height / 2;
    const x = canvas.width / 2;

    var state = {
        players:{
            'player1': new Player(1,x, y, 10, 'white'),
            'player2': new Player(2, x/2, y/2, 10, 'blue')
        }
    }

    function movePlayer(command) {
        console.log(`movendo o ${command.playerId} com o ${command.keyPressed}`)


        const acceptedMoves = {
            ArrowUp(player) {
                player.y = player.y -10
            },
            ArrowDown(player) {
                player.y = player.y + 10
            },
            ArrowLeft(player) {
                player.x = player.x -10
            },
            ArrowRight(player) {
                player.x = player.x +10
            },
        }

        const keyPressed = command.keyPressed
        const player = state.players[command.playerId]
        const moveFunction = acceptedMoves[keyPressed]

        if (moveFunction){
            moveFunction(player)
        }
    }
    return {
        movePlayer,
        state
    }
}

startGameBtn.addEventListener(
    'click', () => {
        modalEl.style.display = 'none'
        renderScreen();
    }
)