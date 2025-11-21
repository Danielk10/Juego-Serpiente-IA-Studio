export enum GameStatus {
  IDLE = 'IDLE',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
}

export enum DirectionKey {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
}

export interface Coordinate {
  x: number;
  y: number;
}

export interface GameTheme {
  name: string;
  backgroundColor: string;
  gridColor: string;
  snakeHeadColor: string;
  snakeBodyColor: string;
  foodColor: string;
  textColor: string;
}

export interface GameConfig {
  gridSize: number; // Number of cells (width/height)
  speed: number; // ms per tick
}
