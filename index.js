const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');


canvas.width = innerWidth;
canvas.height = innerHeight;

const scoreEl = document.querySelector('#scoreEl');
const startGameBtn = document.querySelector('#startGameBtn');
const modalEl = document.querySelector('#modalEl');
const bigScoreEl = document.querySelector('#bigScoreEl');

class Player {
    constructor(x, y, radius, color) {
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

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
       this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }
    draw() {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
    }

    update() {
       this.draw()
        this.x = this.x + this.velocity.x;
        this.y = this.y + this.velocity.y;
    }
}

const friction = 0.99;
let spawn = true;
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        c.fillStyle = this.color;
        c.fill();
        c.restore();
    }

    update() {
       this.draw()
        this.velocity.x *= friction;
        this.velocity.y *= friction;
        this.x = this.x + this.velocity.x ;
        this.y = this.y + this.velocity.y ;
        this.alpha -= 0.01;
    }
}

const y = canvas.height / 2;
const x = canvas.width / 2;

let player = new Player(x, y, 10, 'white');
let projectiles = [];
let enemies = [];
let particles= [];

function init() {
    player = new Player(x, y, 10, 'white');
    projectiles = [];
    enemies = [];
    particles= [];
    score = 0;
    spawn = false;
}


function spawnEnemies() {
    const interval = setInterval(() => {
        const radius = Math.random() * (30 - 5) + 5;
        
        let x;
        let y;
    
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? 0 - radius : player.x + radius;
            y = Math.random() * player.y + 100
        } else {
            x = Math.random() * player.x + 100;
            y = Math.random() < 0.5 ? 0 - radius : player.y + radius;
        }
        //const color = 'green';
        const color = `hsl(${Math.random() * 360}, 50%, 50%)`;
    
        const angle = Math.atan2(
            player.y - y,
            player.x - x
        );
    
        const velocity = {
            x: Math.cos(angle) * 2,
            y: Math.sin(angle) * 2
        };
        console.log('criou um a x9')
        enemies.push(new Enemy(x, y, radius, color, velocity));
        if(spawn === false){clearInterval(interval)}
    }, 1000)
}

let animationId;
let score = 0;

function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)';
    c.fillRect(0,0, canvas.width, canvas.height)
    player.draw();

    particles.forEach((particle, index) => {
        particle.update();
        if (particle.alpha <=0) {
            particles.splice(index, 1);
        }
    })

    projectiles.forEach(((projectile, index) => {
        projectile.update();

        if (projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height

            ) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    }))

    enemies.forEach((enemy, index) => {
            enemy.update();

            const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

            if (dist - enemy.radius - player.radius < 1) {
                cancelAnimationFrame(animationId);
                enemies = [];
                modalEl.style.display = 'flex'
                bigScoreEl.innerHTML = score;
                init();
            }

            projectiles.forEach((projectile, projectileIndex) => {
                const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
                
                //projectiles touch enemy
                if (dist - enemy.radius - projectile.radius < 1) 
                {
                    //explosions
                    for (let index = 0; index < enemy.radius * 8; index++) {
                        const radius = Math.random() * 2;
                        particles.push(
                            new Particle(
                                projectile.x, 
                                projectile.y, 
                                radius, 
                                enemy.color, 
                                { 
                                    x: Math.random() - 0.5 * (Math.random() * 6), 
                                    y: Math.random() - 0.5 * (Math.random() * 6)
                                }
                            )
                        )
                    }
                    if (enemy.radius - 10 > 5) {
                        //increase score
                        score += 100;
                        scoreEl.innerHTML = score;
                        gsap.to(enemy, {
                            radius: enemy.radius - 10
                        })
                        setTimeout(() => {
                            //touch
                            projectiles.splice(projectileIndex, 1);
                        }, 0)
                    } else {
                        //increase score
                        score += 250;
                        scoreEl.innerHTML = score;
                        setTimeout(() => {
                            //touch
                            enemies.splice(index, 1);
                            projectiles.splice(projectileIndex, 1);
                        }, 0)
                    }
                }
            })
        }   
    )
}


addEventListener('keydown', handleKeydown)

function handleKeydown(event){
    const keyPressed = event.key

    console.log(keyPressed)

    if (keyPressed === 'ArrowUp'){
        player.y = player.y - 10
        player.draw()
    }

    if (keyPressed === 'ArrowDown'){
        player.y = player.y + 10
        player.draw()
    }

    if (keyPressed === 'ArrowRight'){
        player.x = player.x + 10
        player.draw()
    }

    if (keyPressed === 'ArrowLeft'){
        player.x = player.x - 10
        player.draw()
    }
}

addEventListener('click', (event) => 
    {
        console.log(projectiles)
        const angle = Math.atan2(
                event.clientY - player.y,
                event.clientX - player.x
        );

        const velocity = {
            x:Math.cos(angle) * 8,
            y:Math.sin(angle) * 8
        };

        console.log(angle)
        projectiles.push(new Projectile (player.x, player.y, 5, 'white', velocity))
    }
)

startGameBtn.addEventListener('click', () =>
{
    animate();
    spawn=true;
    spawnEnemies();
    modalEl.style.display = 'none'

})