import { GoogleGenAI, Type } from "@google/genai";
import { GameTheme } from "../types";

// Initialize the Gemini client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTheme = async (prompt: string): Promise<GameTheme | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Crea un tema de colores visualmente cohesivo para un juego de Serpiente (Snake) basado en este concepto: "${prompt}". 
      Asegúrate de que haya un alto contraste entre la serpiente, la comida y el fondo.
      El fondo debe ser oscuro para mejor visibilidad en pantallas móviles.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Nombre creativo del tema" },
            backgroundColor: { type: Type.STRING, description: "Código Hex para el fondo del canvas" },
            gridColor: { type: Type.STRING, description: "Código Hex para las líneas de la cuadrícula (sutil)" },
            snakeHeadColor: { type: Type.STRING, description: "Código Hex para la cabeza de la serpiente" },
            snakeBodyColor: { type: Type.STRING, description: "Código Hex para el cuerpo de la serpiente" },
            foodColor: { type: Type.STRING, description: "Código Hex para la manzana/comida" },
            textColor: { type: Type.STRING, description: "Código Hex para texto superpuesto" }
          },
          required: ["name", "backgroundColor", "gridColor", "snakeHeadColor", "snakeBodyColor", "foodColor", "textColor"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GameTheme;
    }
    return null;
  } catch (error) {
    console.error("Failed to generate theme:", error);
    return null;
  }
};

export const getAiGameTip = async (score: number): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `El jugador acaba de perder en el juego de la Serpiente con una puntuación de ${score}. Dale un consejo muy corto (máximo 10 palabras), ingenioso o sarcástico en Español sobre cómo jugar mejor.`,
        });
        return response.text || "¡Inténtalo de nuevo!";
    } catch (e) {
        return "¡Buen intento! Juega otra vez.";
    }
}