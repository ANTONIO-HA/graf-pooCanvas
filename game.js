// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Clase Ball (Pelota)
class Ball {
    constructor(x, y, radius, speedX, speedY, color) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = color;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }

    move() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Colisión con la parte superior e inferior
        if (this.y - this.radius <= 0 || this.y + this.radius >= canvas.height) {
            this.speedY = -this.speedY;
        }
    }

    reset() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.speedX = -this.speedX; // Cambia dirección al resetear
    }
}

// Clase Paddle (Paleta)
class Paddle {
    constructor(x, y, width, height, isPlayerControlled = false, color = 'white') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isPlayerControlled = isPlayerControlled;
        this.speed = 5; // Velocidad base
        this.color = color;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    move(direction) {
        if (direction === 'up' && this.y > 0) {
            this.y -= this.speed;
        } else if (direction === 'down' && this.y + this.height < canvas.height) {
            this.y += this.speed;
        }
    }

    // Movimiento de la paleta automática (IA)
    autoMove(balls) {
        let targetBall = null;
        let closestX = 0;

        // Buscar la pelota que sea la amenaza más cercana
        balls.forEach(ball => {
            // Solo evaluar pelotas que se mueven hacia la CPU (derecha)
            if (ball.speedX > 0) {
                // Encontrar la que esté más a la derecha (más cerca de la CPU)
                if (ball.x > closestX) {
                    closestX = ball.x;
                    targetBall = ball;
                }
            }
        });

        // Si no hay ninguna pelota moviéndose hacia la CPU, que siga a la primera por defecto
        if (!targetBall) {
            targetBall = balls[0];
        }

        // Mover la paleta hacia la pelota objetivo
        // Se usa un margen de +-10 para que la paleta no "tiemble" al alinear exactamente el centro
        if (targetBall.y < this.y + this.height / 2 - 10) {
            this.y -= this.speed;
        } else if (targetBall.y > this.y + this.height / 2 + 10) {
            this.y += this.speed;
        }
    }
}

// Clase Game (Controla el juego)
class Game {
    constructor() {
        // Arreglo con 5 pelotas (velocidad aumentada)
        this.balls = [
            new Ball(canvas.width / 2, canvas.height / 2, 10, 6, 6, 'white'),
            new Ball(canvas.width / 2, canvas.height / 2, 15, -5, 7, 'yellow'),
            new Ball(canvas.width / 2, canvas.height / 2, 8, 7, -5, '#00ff00'),
            new Ball(canvas.width / 2, canvas.height / 2, 12, -6, -8, '#00ffff'),
            new Ball(canvas.width / 2, canvas.height / 2, 20, 5, 5, '#ff00ff')
        ];

        // Jugador: Se ajusta la posición Y, se le da 200 de alto (el doble) y color azul
        this.paddle1 = new Paddle(0, canvas.height / 2 - 100, 10, 200, true, '#4da6ff'); 
        this.paddle1.speed = 9; // Velocidad aumentada para el jugador

        // CPU: Aumentada de 100 a 130 de alto, se ajusta su Y para centrarla, y color rojo
        this.paddle2 = new Paddle(canvas.width - 10, canvas.height / 2 - 65, 10, 130, false, '#ff4d4d'); 
        // Nota: Le dejé su velocidad base (5) para que no sea invencible.
        
        this.keys = {}; // Para capturar las teclas
    }

    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar todas las pelotas
        this.balls.forEach(ball => ball.draw());
        
        this.paddle1.draw();
        this.paddle2.draw();
    }

    update() {
        // Movimiento de la paleta 1 (Jugador) controlado por teclas
        if (this.keys['ArrowUp']) {
            this.paddle1.move('up');
        }
        if (this.keys['ArrowDown']) {
            this.paddle1.move('down');
        }

        // Movimiento de la paleta 2 (Controlada por IA) pasándole todas las pelotas
        this.paddle2.autoMove(this.balls);

        // Lógica individual para cada pelota
        this.balls.forEach(ball => {
            ball.move();

            // Colisiones con la paleta 1 (Jugador)
            if (ball.x - ball.radius <= this.paddle1.x + this.paddle1.width &&
                ball.y >= this.paddle1.y && ball.y <= this.paddle1.y + this.paddle1.height) {
                // Asegurar que rebote hacia la derecha
                ball.speedX = Math.abs(ball.speedX); 
            }

            // Colisiones con la paleta 2 (CPU)
            if (ball.x + ball.radius >= this.paddle2.x &&
                ball.y >= this.paddle2.y && ball.y <= this.paddle2.y + this.paddle2.height) {
                // Asegurar que rebote hacia la izquierda
                ball.speedX = -Math.abs(ball.speedX);
            }

            // Detectar cuando la pelota sale de los bordes
            if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
                ball.reset();
            }
        });
    }

    // Captura de teclas para el control de la paleta
    handleInput() {
        window.addEventListener('keydown', (event) => {
            this.keys[event.key] = true;
        });

        window.addEventListener('keyup', (event) => {
            this.keys[event.key] = false;
        });
    }

    run() {
        this.handleInput();
        const gameLoop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
}

// Crear instancia del juego y ejecutarlo
const game = new Game();
game.run();