import { KEY_MAPPINGS, DEFAULT_THEME, GAME_STATUS } from './constants.js';
import { generateTheme, getAiTip } from './services/geminiService.js';

/**
 * Manejador de Interfaz de Usuario (UI Manager)
 * Conecta el DOM con la lógica del juego.
 */
export class UIManager {
    constructor(game) {
        this.game = game;
        this.currentTheme = DEFAULT_THEME;
        
        // Elementos DOM
        this.els = {
            score: document.getElementById('scoreDisplay'),
            highScore: document.getElementById('highScoreDisplay'),
            startScreen: document.getElementById('startScreen'),
            gameOverScreen: document.getElementById('gameOverScreen'),
            pauseScreen: document.getElementById('pauseScreen'),
            overlay: document.getElementById('overlay'),
            aiLoader: document.getElementById('aiLoader'),
            aiMessage: document.getElementById('aiMessage'),
            themeInput: document.getElementById('themeInput'),
            themeBtn: document.getElementById('themeBtn'),
            btns: {
                start: document.getElementById('startBtn'),
                restart: document.getElementById('restartBtn'),
                pause: document.getElementById('pauseBtn'),
                resume: document.getElementById('resumeBtn'),
                up: document.getElementById('btnUp'),
                down: document.getElementById('btnDown'),
                left: document.getElementById('btnLeft'),
                right: document.getElementById('btnRight')
            }
        };

        // Vincular método de dibujo del juego para usar el tema actual
        this.game.onDrawRequest = () => this.game.draw(this.currentTheme);
        
        this.init();
    }

    init() {
        this.setupControls();
        this.setupThemeGenerator();
        
        // Render inicial
        this.game.draw(this.currentTheme);
    }

    setupControls() {
        // Teclado
        window.addEventListener('keydown', (e) => {
            if (KEY_MAPPINGS[e.key]) {
                e.preventDefault(); // Evitar scroll con flechas
                this.game.setDirection(KEY_MAPPINGS[e.key]);
            }
            // Espacio para Pausa
            if (e.code === 'Space') this.togglePause();
        });

        // Touch D-Pad (Pointer events para respuesta rápida)
        const bindBtn = (elem, dir) => {
            if (!elem) return;
            elem.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                this.game.setDirection(dir);
                if (navigator.vibrate) navigator.vibrate(10);
            });
        };

        bindBtn(this.els.btns.up, 'UP');
        bindBtn(this.els.btns.down, 'DOWN');
        bindBtn(this.els.btns.left, 'LEFT');
        bindBtn(this.els.btns.right, 'RIGHT');

        // Botones UI
        this.els.btns.start.onclick = () => this.startGame();
        this.els.btns.restart.onclick = () => this.startGame();
        this.els.btns.pause.onclick = () => this.togglePause();
        this.els.btns.resume.onclick = () => this.togglePause();
    }

    setupThemeGenerator() {
        this.els.themeBtn.onclick = async () => {
            const prompt = this.els.themeInput.value;
            if (!prompt.trim()) return;
            
            // UI Loading
            this.els.aiLoader.classList.remove('hidden');
            this.els.themeInput.blur();

            // Llamada AI
            const newTheme = await generateTheme(prompt);
            
            this.els.aiLoader.classList.add('hidden');
            
            if (newTheme) {
                this.currentTheme = newTheme;
                this.applyThemeCSS();
                this.game.draw(this.currentTheme);
                this.els.themeInput.value = '';
            }
        };
    }

    applyThemeCSS() {
        // Actualizar colores globales de la página para combinar
        document.body.style.backgroundColor = this.currentTheme.backgroundColor;
        document.getElementById('scoreDisplay').style.color = this.currentTheme.snakeHeadColor;
        document.getElementById('highScoreDisplay').style.color = this.currentTheme.snakeBodyColor;
    }

    startGame() {
        this.els.overlay.classList.add('hidden');
        this.els.startScreen.classList.add('hidden');
        this.els.gameOverScreen.classList.add('hidden');
        this.els.pauseScreen.classList.add('hidden');
        
        this.game.reset(); // Reinicia lógica
        this.game.start(); // Inicia loop
    }

    togglePause() {
        const status = this.game.pause();
        if (status === GAME_STATUS.PAUSED) {
            this.els.overlay.classList.remove('hidden');
            this.els.pauseScreen.classList.remove('hidden');
        } else if (status === GAME_STATUS.PLAYING) {
            this.els.overlay.classList.add('hidden');
            this.els.pauseScreen.classList.add('hidden');
        }
    }

    // Callbacks del Juego
    updateScore(score, high) {
        this.els.score.innerText = score;
        this.els.highScore.innerText = high;
    }

    async showGameOver(score) {
        this.els.overlay.classList.remove('hidden');
        this.els.gameOverScreen.classList.remove('hidden');
        
        this.els.aiMessage.innerText = "Analizando tu desempeño...";
        this.els.aiMessage.classList.add('animate-pulse');
        
        const tip = await getAiTip(score);
        
        this.els.aiMessage.classList.remove('animate-pulse');
        this.els.aiMessage.innerText = `"${tip}"`;
    }
}