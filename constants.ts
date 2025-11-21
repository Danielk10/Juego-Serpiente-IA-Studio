import { GameTheme, GameConfig, DirectionKey, Coordinate } from './types';

export const GRID_COUNT = 20; // 20x20 grid
export const INITIAL_SPEED = 140; // ms (Slightly faster for mobile feel)
export const SPEED_DECREMENT = 2; 
export const MIN_SPEED = 60;

export const DEFAULT_THEME: GameTheme = {
  name: 'Neón Clásico',
  backgroundColor: '#020617', // slate-950
  gridColor: '#1e293b', // slate-800
  snakeHeadColor: '#10b981', // emerald-500
  snakeBodyColor: '#34d399', // emerald-400
  foodColor: '#ef4444', // red-500
  textColor: '#f8fafc', // slate-50
};

export const INITIAL_SNAKE: Coordinate[] = [
  { x: 10, y: 15 },
  { x: 10, y: 16 },
  { x: 10, y: 17 },
];

export const DIRECTIONS: Record<DirectionKey, Coordinate> = {
  [DirectionKey.UP]: { x: 0, y: -1 },
  [DirectionKey.DOWN]: { x: 0, y: 1 },
  [DirectionKey.LEFT]: { x: -1, y: 0 },
  [DirectionKey.RIGHT]: { x: 1, y: 0 },
};

export const KEY_MAPPINGS: Record<string, DirectionKey> = {
  ArrowUp: DirectionKey.UP,
  w: DirectionKey.UP,
  W: DirectionKey.UP,
  ArrowDown: DirectionKey.DOWN,
  s: DirectionKey.DOWN,
  S: DirectionKey.DOWN,
  ArrowLeft: DirectionKey.LEFT,
  a: DirectionKey.LEFT,
  A: DirectionKey.LEFT,
  ArrowRight: DirectionKey.RIGHT,
  d: DirectionKey.RIGHT,
  D: DirectionKey.RIGHT,
};