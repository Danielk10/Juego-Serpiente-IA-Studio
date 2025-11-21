import { GameTheme, DirectionKey, GameStatus } from '../types';
import { KEY_MAPPINGS, DEFAULT_THEME } from '../constants';
import { generateTheme, getAiGameTip } from '../services/geminiService';
import { SnakeGame } from './GameCanvas';

export class UIManager {
    game: SnakeGame;
    currentTheme: GameTheme;
    
    // DOM Elements
    els: {
        score: HTMLElement;
        highScore: HTMLElement;
        startScreen: HTMLElement;
        gameOverScreen: HTMLElement;
        overlay: HTMLElement;
        aiLoader: HTMLElement;
        aiMessage: HTMLElement;
        themeInput: HTMLInputElement;
    };

    constructor(gameInstance: SnakeGame) {
        this.game = gameInstance;
        this.currentTheme = DEFAULT_THEME;
        
        // Map DOM
        this.els = {
            score: document.getElementById('scoreDisplay')!,
            highScore: document.getElementById('highScoreDisplay')!,
            startScreen: document.getElementById('startScreen')!,
            gameOverScreen: document.getElementById('gameOverScreen')!,
            overlay: document.getElementById('overlay')!,
            aiLoader: document.getElementById('aiLoader')!,
            aiMessage: document.getElementById('aiMessage')!,
            themeInput: document.getElementById('themeInput') as HTMLInputElement
        };

        this.initListeners();
        this.game.renderFrame(this.currentTheme); // Initial draw
    }

    initListeners() {
        // Start Button
        document.getElementById('startBtn')?.addEventListener('click', () => {
            this.hideOverlay();
            this.game.start();
        });

        // Restart Button
        document.getElementById('restartBtn')?.addEventListener('click', () => {
            this.hideOverlay();
            this.game.resetState();
            this.game.start();
        });

        // Pause Button
        document.getElementById('pauseBtn')?.addEventListener('click', () => {
            this.game.pause();
            if (this.game.status === GameStatus.PAUSED) {
                this.showOverlay(false); // Show simple pause overlay concept?
                // For now, just toggle text or similar. 
                // Re-using start screen for pause simplicity or just visual pause
                this.els.startScreen.classList.remove('hidden');
                this.els.startScreen.querySelector('h1')!.innerHTML = "PAUSA";
                this.els.startScreen.querySelector('button')!.innerText = "CONTINUAR";
                this.els.overlay.classList.remove('hidden');
            }
        });

        // Theme Generator
        document.getElementById('themeBtn')?.addEventListener('click', () => this.handleThemeGen());

        // Keyboard Controls
        window.addEventListener('keydown', (e) => {
            const dir = KEY_MAPPINGS[e.key];
            if (dir) this.game.setDirection(dir);
        });

        // Touch Controls (D-Pad)
        const dirs = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
        dirs.forEach(d => {
            const btn = document.getElementById(`btn${d.charAt(0) + d.slice(1).toLowerCase()}`);
            if (btn) {
                // Prevent default to stop double firing or scrolling
                btn.addEventListener('pointerdown', (e) => {
                    e.preventDefault();
                    this.game.setDirection(d as DirectionKey);
                    if (navigator.vibrate) navigator.vibrate(10); // Feedback táctil
                });
            }
        });
    }

    updateScore(score: number, highScore: number) {
        this.els.score.innerText = score.toString();
        this.els.highScore.innerText = highScore.toString();
    }

    async handleGameOver(score: number) {
        this.showOverlay(true); // Show Game Over
        this.els.aiMessage.innerText = "Analizando partida...";
        const tip = await getAiGameTip(score);
        this.els.aiMessage.innerText = `"${tip}"`;
    }

    async handleThemeGen() {
        const prompt = this.els.themeInput.value;
        if (!prompt) return;
        
        if (!process.env.API_KEY) {
            alert("Falta API Key");
            return;
        }

        this.els.aiLoader.classList.remove('hidden');
        
        const newTheme = await generateTheme(prompt);
        this.els.aiLoader.classList.add('hidden');

        if (newTheme) {
            this.currentTheme = newTheme;
            this.applyThemeUI();
            this.game.renderFrame(this.currentTheme);
            this.els.themeInput.value = '';
        }
    }

    applyThemeUI() {
        // Apply dynamic colors to UI text where appropriate
        this.els.score.style.color = this.currentTheme.snakeHeadColor;
        document.body.style.backgroundColor = this.currentTheme.backgroundColor;
    }

    hideOverlay() {
        this.els.overlay.classList.add('hidden');
        this.els.startScreen.classList.add('hidden');
        this.els.gameOverScreen.classList.add('hidden');
    }

    showOverlay(isGameOver: boolean) {
        this.els.overlay.classList.remove('hidden');
        if (isGameOver) {
            this.els.gameOverScreen.classList.remove('hidden');
            this.els.startScreen.classList.add('hidden');
        } else {
            this.els.startScreen.classList.remove('hidden');
            this.els.gameOverScreen.classList.add('hidden');
        }
    }

    // Gameloop hook to redraw if needed
    render() {
        this.game.draw(this.currentTheme);
    }
}