// Constantes del Juego
export const GRID_COUNT = 20; // Cuadrícula de 20x20
export const BASE_SPEED = 160; // Milisegundos por frame (Velocidad inicial)
export const MIN_SPEED = 70; // Velocidad máxima (mínimo ms)
export const SPEED_DECREMENT = 3; // Cuánto acelera por cada comida

// Enums simulados
export const DIRECTION = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT'
};

export const GAME_STATUS = {
    IDLE: 'IDLE',
    PLAYING: 'PLAYING',
    PAUSED: 'PAUSED',
    GAMEOVER: 'GAMEOVER'
};

// Mapeo de Teclado
export const KEY_MAPPINGS = {
    'ArrowUp': DIRECTION.UP,
    'w': DIRECTION.UP,
    'W': DIRECTION.UP,
    'ArrowDown': DIRECTION.DOWN,
    's': DIRECTION.DOWN,
    'S': DIRECTION.DOWN,
    'ArrowLeft': DIRECTION.LEFT,
    'a': DIRECTION.LEFT,
    'A': DIRECTION.LEFT,
    'ArrowRight': DIRECTION.RIGHT,
    'd': DIRECTION.RIGHT,
    'D': DIRECTION.RIGHT
};

// Tema por Defecto (Neón)
export const DEFAULT_THEME = {
    name: 'Neón Clásico',
    backgroundColor: '#020617', // Fondo muy oscuro
    gridColor: '#1e293b',       // Rejilla sutil
    snakeHeadColor: '#10b981',  // Cabeza brillante
    snakeBodyColor: '#34d399',  // Cuerpo
    foodColor: '#ef4444',       // Comida roja
    textColor: '#f8fafc'        // Texto claro
};