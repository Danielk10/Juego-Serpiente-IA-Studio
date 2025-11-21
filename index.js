import { SnakeGame } from './game.js';
import { UIManager } from './ui.js';

// Inicialización cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    
    // Referencia temporal para la UI que se creará después
    let uiManager;

    // Instanciar lógica del juego
    const game = new SnakeGame(
        canvas,
        {
            onScoreUpdate: (s, h) => uiManager?.updateScore(s, h),
            onGameOver: (s) => uiManager?.showGameOver(s)
        }
    );

    // Instanciar UI Manager
    uiManager = new UIManager(game);

    console.log("Snake Neón IA - Iniciado en Modo JS/POO");
});