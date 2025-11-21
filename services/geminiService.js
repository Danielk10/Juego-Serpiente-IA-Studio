import { GoogleGenAI, Type } from "@google/genai";
import { DEFAULT_THEME } from "../constants.js";

// Inicializar cliente AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Genera un tema visual basado en un prompt de texto.
 * @param {string} prompt - Descripción del tema (ej: "Volcán", "Hielo").
 * @returns {Promise<Object>} Objeto de tema.
 */
export const generateTheme = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Genera un esquema de colores JSON para un juego de Snake basado en: "${prompt}".
      Reglas:
      1. Alto contraste. Fondo oscuro preferible.
      2. Colores en formato Hexadecimal.
      3. Salida JSON pura.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            backgroundColor: { type: Type.STRING },
            gridColor: { type: Type.STRING },
            snakeHeadColor: { type: Type.STRING },
            snakeBodyColor: { type: Type.STRING },
            foodColor: { type: Type.STRING },
            textColor: { type: Type.STRING }
          },
          required: ["name", "backgroundColor", "gridColor", "snakeHeadColor", "snakeBodyColor", "foodColor", "textColor"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return DEFAULT_THEME;
  } catch (error) {
    console.error("Error generando tema:", error);
    return null;
  }
};

/**
 * Obtiene un consejo sarcástico o útil cuando el jugador pierde.
 * @param {number} score - Puntuación final.
 * @returns {Promise<string>} Consejo.
 */
export const getAiTip = async (score) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Un jugador acaba de perder en Snake con ${score} puntos.
            Dame una frase corta (max 15 palabras), graciosa, sarcástica o motivadora en Español para mostrarle en la pantalla de Game Over.
            Si el puntaje es bajo, burlate un poco. Si es alto, felicítalo.`,
        });
        return response.text.trim();
    } catch (e) {
        return "¡Más suerte la próxima vez!";
    }
};