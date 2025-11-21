import { GRID_COUNT, BASE_SPEED, MIN_SPEED, SPEED_DECREMENT, DIRECTION, GAME_STATUS, DEFAULT_THEME } from './constants.js';

/**
 * Clase Principal del Motor de Juego
 * Maneja el bucle de renderizado, lógica de colisiones y estado.
 */
export class SnakeGame {
    constructor(canvas, callbacks) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Callbacks para comunicar con la UI
        this.onScoreUpdate = callbacks.onScoreUpdate;
        this.onGameOver = callbacks.onGameOver;

        // Estado Inicial
        this.state = {
            snake: [],
            food: { x: 0, y: 0 },
            direction: DIRECTION.UP,
            nextDirection: DIRECTION.UP,
            score: 0,
            highScore: parseInt(localStorage.getItem('snake_highscore') || '0'),
            status: GAME_STATUS.IDLE,
            speed: BASE_SPEED
        };

        // Control de Tiempo
        this.lastFrameTime = 0;
        this.animationFrameId = null;
        
        // Inicializar
        this.reset();
        this.bindEvents();
    }

    /**
     * Reinicia el estado del juego para una nueva partida
     */
    reset() {
        // Posición inicial centro
        const startX = Math.floor(GRID_COUNT / 2);
        const startY = Math.floor(GRID_COUNT / 2);

        this.state.snake = [
            { x: startX, y: startY },
            { x: startX, y: startY + 1 },
            { x: startX, y: startY + 2 }
        ];
        
        this.state.direction = DIRECTION.UP;
        this.state.nextDirection = DIRECTION.UP;
        this.state.score = 0;
        this.state.speed = BASE_SPEED;
        this.state.status = GAME_STATUS.IDLE;
        
        this.generateFood();
        this.onScoreUpdate(this.state.score, this.state.highScore);
        
        // Dibujar estado inicial
        this.draw(DEFAULT_THEME);
    }

    bindEvents() {
        // Asegurar que el canvas se vea bien
        this.ctx.imageSmoothingEnabled = false;
    }

    start() {
        if (this.state.status === GAME_STATUS.PLAYING) return;
        
        this.state.status = GAME_STATUS.PLAYING;
        this.lastFrameTime = performance.now();
        this.gameLoop();
    }

    pause() {
        if (this.state.status === GAME_STATUS.PLAYING) {
            this.state.status = GAME_STATUS.PAUSED;
            cancelAnimationFrame(this.animationFrameId);
        } else if (this.state.status === GAME_STATUS.PAUSED) {
            this.state.status = GAME_STATUS.PLAYING;
            this.lastFrameTime = performance.now();
            this.gameLoop();
        }
        return this.state.status;
    }

    setDirection(newDir) {
        if (this.state.status !== GAME_STATUS.PLAYING) {
            // Permitir comenzar juego al presionar una tecla si está IDLE
            if (this.state.status === GAME_STATUS.IDLE) this.start();
            else return;
        }

        const current = this.state.direction;
        
        // Prevenir reversa inmediata
        const opposites = {
            [DIRECTION.UP]: DIRECTION.DOWN,
            [DIRECTION.DOWN]: DIRECTION.UP,
            [DIRECTION.LEFT]: DIRECTION.RIGHT,
            [DIRECTION.RIGHT]: DIRECTION.LEFT
        };

        if (opposites[newDir] !== current) {
            this.state.nextDirection = newDir;
        }
    }

    generateFood() {
        let valid = false;
        while (!valid) {
            const x = Math.floor(Math.random() * GRID_COUNT);
            const y = Math.floor(Math.random() * GRID_COUNT);
            
            // Verificar que no aparezca sobre la serpiente
            const collision = this.state.snake.some(seg => seg.x === x && seg.y === y);
            if (!collision) {
                this.state.food = { x, y };
                valid = true;
            }
        }
    }

    update() {
        // Actualizar dirección
        this.state.direction = this.state.nextDirection;
        
        const head = { ...this.state.snake[0] };
        
        // Calcular nueva cabeza
        switch (this.state.direction) {
            case DIRECTION.UP: head.y -= 1; break;
            case DIRECTION.DOWN: head.y += 1; break;
            case DIRECTION.LEFT: head.x -= 1; break;
            case DIRECTION.RIGHT: head.x += 1; break;
        }

        // 1. Colisión con Paredes
        if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
            this.gameOver();
            return;
        }

        // 2. Colisión con Cuerpo
        if (this.state.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
            this.gameOver();
            return;
        }

        // Mover serpiente (añadir cabeza)
        this.state.snake.unshift(head);

        // 3. Comer
        if (head.x === this.state.food.x && head.y === this.state.food.y) {
            this.state.score += 10;
            
            // Vibración
            if (navigator.vibrate) navigator.vibrate(40);

            // Actualizar Record
            if (this.state.score > this.state.highScore) {
                this.state.highScore = this.state.score;
                localStorage.setItem('snake_highscore', this.state.highScore);
            }

            // Aumentar Velocidad
            this.state.speed = Math.max(MIN_SPEED, this.state.speed - SPEED_DECREMENT);
            
            this.onScoreUpdate(this.state.score, this.state.highScore);
            this.generateFood();
        } else {
            // Si no come, remover cola para mantener longitud
            this.state.snake.pop();
        }
    }

    gameOver() {
        this.state.status = GAME_STATUS.GAMEOVER;
        if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
        this.onGameOver(this.state.score);
        cancelAnimationFrame(this.animationFrameId);
    }

    draw(theme) {
        const size = this.canvas.width;
        const cellSize = size / GRID_COUNT;

        // Limpiar y Fondo
        this.ctx.fillStyle = theme.backgroundColor;
        this.ctx.fillRect(0, 0, size, size);

        // Dibujar Comida (Círculo con Glow)
        const fx = this.state.food.x * cellSize + cellSize/2;
        const fy = this.state.food.y * cellSize + cellSize/2;
        
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = theme.foodColor;
        this.ctx.fillStyle = theme.foodColor;
        this.ctx.beginPath();
        this.ctx.arc(fx, fy, cellSize * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Dibujar Serpiente
        this.state.snake.forEach((seg, index) => {
            const isHead = index === 0;
            this.ctx.fillStyle = isHead ? theme.snakeHeadColor : theme.snakeBodyColor;
            
            // Efecto Neón en la cabeza
            if (isHead) {
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = theme.snakeHeadColor;
            } else {
                this.ctx.shadowBlur = 0;
            }

            const padding = 1;
            this.ctx.fillRect(
                seg.x * cellSize + padding,
                seg.y * cellSize + padding,
                cellSize - padding * 2,
                cellSize - padding * 2
            );
        });
    }

    gameLoop(timestamp) {
        if (this.state.status !== GAME_STATUS.PLAYING) return;

        if (!timestamp) timestamp = performance.now();
        const deltaTime = timestamp - this.lastFrameTime;

        if (deltaTime >= this.state.speed) {
            this.update();
            this.lastFrameTime = timestamp;
        }
        
        // Dibujar siempre para mantener el tema actualizado si cambiara dinámicamente
        // En este caso, pasamos el tema actual desde fuera en render
        // Pero para simplicidad, el Game Loop dispara callbacks de dibujo o guarda referencia al tema.
        // Aquí asumimos que 'draw' se llama desde fuera o guardamos el tema.
        // Para POO estricto, pasaremos un callback 'onDraw' o guardaremos el tema en el estado.
        
        if (this.onDrawRequest) this.onDrawRequest();

        this.animationFrameId = requestAnimationFrame((t) => this.gameLoop(t));
    }
}