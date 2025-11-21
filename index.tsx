import { SnakeGame } from './components/GameCanvas';
import { UIManager } from './components/ThemeGenerator';

// Start the application logic once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    
    const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
    
    // Instantiate Game Logic (POO)
    // We pass callbacks to the game to update the UI manager
    let ui: UIManager;

    const game = new SnakeGame(
        canvas,
        (score: number, high: number) => ui?.updateScore(score, high),
        (score: number) => ui?.handleGameOver(score)
    );

    // Instantiate UI Manager
    ui = new UIManager(game);

    // Hook render loop to UI theme
    const originalLoop = game.loop;
    game.loop = (timestamp) => {
        originalLoop(timestamp);
        if (game.status === 'PLAYING') {
            game.draw(ui.currentTheme);
        }
    };

    console.log("Snake AI Engine Started");
});