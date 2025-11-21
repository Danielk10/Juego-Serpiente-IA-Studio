import { GameTheme, GameStatus, DirectionKey, Coordinate } from '../types';
import { GRID_COUNT, INITIAL_SPEED, INITIAL_SNAKE, DIRECTIONS, SPEED_DECREMENT, MIN_SPEED } from '../constants';

/**
 * Clase principal que controla la lógica del juego.
 * Sigue principios POO para gestión de estado.
 */
export class SnakeGame {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    
    // Estado del juego
    snake: Coordinate[];
    food: Coordinate;
    direction: DirectionKey;
    nextDirection: DirectionKey;
    status: GameStatus;
    score: number;
    highScore: number;
    speed: number;
    
    // Loop controls
    lastTime: number;
    accumulator: number;
    loopId: number | null;

    // Callbacks para la UI
    onScoreChange: (score: number, highScore: number) => void;
    onGameOver: (score: number) => void;

    constructor(canvas: HTMLCanvasElement, onScoreChange: any, onGameOver: any) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.onScoreChange = onScoreChange;
        this.onGameOver = onGameOver;

        // Restaurar highscore local
        const saved = localStorage.getItem('snake_highscore');
        this.highScore = saved ? parseInt(saved) : 0;

        this.resetState();
        
        // Bind loop
        this.loop = this.loop.bind(this);
    }

    resetState() {
        this.snake = [...INITIAL_SNAKE];
        this.direction = DirectionKey.UP;
        this.nextDirection = DirectionKey.UP;
        this.score = 0;
        this.speed = INITIAL_SPEED;
        this.status = GameStatus.IDLE;
        this.food = this.generateFood();
        
        // Reset loop vars
        this.lastTime = 0;
        this.accumulator = 0;
        
        this.onScoreChange(this.score, this.highScore);
    }

    start() {
        if (this.status === GameStatus.PLAYING) return;
        
        if (this.status === GameStatus.GAME_OVER) {
            this.resetState();
        }
        
        this.status = GameStatus.PLAYING;
        this.lastTime = performance.now();
        this.loopId = requestAnimationFrame(this.loop);
    }

    pause() {
        if (this.status === GameStatus.PLAYING) {
            this.status = GameStatus.PAUSED;
            if (this.loopId) cancelAnimationFrame(this.loopId);
        } else if (this.status === GameStatus.PAUSED) {
            this.status = GameStatus.PLAYING;
            this.lastTime = performance.now();
            this.loopId = requestAnimationFrame(this.loop);
        }
    }

    setDirection(dir: DirectionKey) {
        if (this.status !== GameStatus.PLAYING) return;
        
        // Evitar giro de 180 grados
        const isOpposite =
            (dir === DirectionKey.UP && this.direction === DirectionKey.DOWN) ||
            (dir === DirectionKey.DOWN && this.direction === DirectionKey.UP) ||
            (dir === DirectionKey.LEFT && this.direction === DirectionKey.RIGHT) ||
            (dir === DirectionKey.RIGHT && this.direction === DirectionKey.LEFT);

        if (!isOpposite) {
            this.nextDirection = dir;
        }
    }

    generateFood(): Coordinate {
        let newFood: Coordinate;
        let valid = false;
        while (!valid) {
            newFood = {
                x: Math.floor(Math.random() * GRID_COUNT),
                y: Math.floor(Math.random() * GRID_COUNT)
            };
            // Check collision with snake
            // eslint-disable-next-line no-loop-func
            valid = !this.snake.some(s => s.x === newFood.x && s.y === newFood.y);
        }
        return newFood!;
    }

    update() {
        // Update direction based on input buffer
        this.direction = this.nextDirection;
        
        const head = this.snake[0];
        const move = DIRECTIONS[this.direction];
        const newHead = { x: head.x + move.x, y: head.y + move.y };

        // Choque con paredes
        if (newHead.x < 0 || newHead.x >= GRID_COUNT || newHead.y < 0 || newHead.y >= GRID_COUNT) {
            this.triggerGameOver();
            return;
        }

        // Choque consigo mismo
        if (this.snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
            this.triggerGameOver();
            return;
        }

        // Movimiento
        this.snake.unshift(newHead);

        // Comer
        if (newHead.x === this.food.x && newHead.y === this.food.y) {
            this.score += 10;
            if (this.score > this.highScore) {
                this.highScore = this.score;
                localStorage.setItem('snake_highscore', this.highScore.toString());
            }
            this.speed = Math.max(MIN_SPEED, this.speed - SPEED_DECREMENT);
            this.food = this.generateFood();
            this.onScoreChange(this.score, this.highScore);
            
            // Haptic feedback simple
            if (navigator.vibrate) navigator.vibrate(30);
            
        } else {
            this.snake.pop();
        }
    }

    triggerGameOver() {
        this.status = GameStatus.GAME_OVER;
        if (this.loopId) cancelAnimationFrame(this.loopId);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Vibración de error
        this.onGameOver(this.score);
    }

    draw(theme: GameTheme) {
        const size = this.canvas.width;
        const cellSize = size / GRID_COUNT;

        // Fondo
        this.ctx.fillStyle = theme.backgroundColor;
        this.ctx.fillRect(0, 0, size, size);

        // Cuadrícula (Opcional, si el tema es muy oscuro ayuda)
        this.ctx.strokeStyle = theme.gridColor;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;
        for(let i=0; i<=GRID_COUNT; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * cellSize, 0);
            this.ctx.lineTo(i * cellSize, size);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * cellSize);
            this.ctx.lineTo(size, i * cellSize);
            this.ctx.stroke();
        }
        this.ctx.globalAlpha = 1.0;

        // Comida
        this.ctx.fillStyle = theme.foodColor;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = theme.foodColor;
        this.ctx.beginPath();
        const fx = this.food.x * cellSize + cellSize/2;
        const fy = this.food.y * cellSize + cellSize/2;
        this.ctx.arc(fx, fy, (cellSize/2) - 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        // Serpiente
        this.snake.forEach((seg, idx) => {
            this.ctx.fillStyle = idx === 0 ? theme.snakeHeadColor : theme.snakeBodyColor;
            
            if (idx === 0) {
                 this.ctx.shadowBlur = 10;
                 this.ctx.shadowColor = theme.snakeHeadColor;
            }

            const pad = 2;
            this.ctx.fillRect(
                seg.x * cellSize + pad,
                seg.y * cellSize + pad,
                cellSize - pad * 2,
                cellSize - pad * 2
            );
            this.ctx.shadowBlur = 0;
        });
    }

    loop(timestamp: number) {
        if (this.status !== GameStatus.PLAYING) return;

        const deltaTime = timestamp - this.lastTime;
        
        if (deltaTime >= this.speed) {
            this.update();
            this.lastTime = timestamp;
        }
        
        // Redraw every frame for smooth animations (if we added animations)
        // but here we just draw when data dictates implicitly by frame rate
        // Actually, strict render loop:
        this.loopId = requestAnimationFrame(this.loop);
    }
    
    // Separate render call for external theme updates
    renderFrame(theme: GameTheme) {
        this.draw(theme);
    }
}