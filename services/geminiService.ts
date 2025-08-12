
import { GoogleGenAI, Type } from "@google/genai";
import { Question, TestType } from '../types';
import { shuffle } from '../utils/shuffle';

// Defines the JSON schema for a single question object.
// This ensures the AI's response is structured correctly.
const questionSchema = {
    type: Type.OBJECT,
    properties: {
        text: { 
            type: Type.STRING, 
            description: 'El texto de la pregunta.' 
        },
        options: {
            type: Type.ARRAY,
            description: 'Un arreglo de 4 a 5 posibles respuestas.',
            items: {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: 'Letra de la opción (A, B, C, D, E).' },
                    text: { type: Type.STRING, description: 'El texto de la opción.' }
                },
                required: ['id', 'text']
            }
        },
        correctAnswerId: { 
            type: Type.STRING, 
            description: 'La letra ID de la respuesta correcta.' 
        },
        explanation: { 
            type: Type.STRING, 
            description: 'Una explicación clara y concisa de por qué la respuesta es correcta.' 
        }
    },
    required: ['text', 'options', 'correctAnswerId', 'explanation']
};


const getPromptForTest = (testType: TestType, section: string, count: number): string => {
    const basePrompt = (testType === TestType.PAA)
        ? `Genera ${count} preguntas de opción múltiple para la sección "${section}" de la prueba PAA (Prueba de Aptitud Académica) de la UFM.`
        : `Genera ${count} preguntas de opción múltiple para un examen tipo OTIS, enfocado en "${section}".`;

    return `${basePrompt} Las preguntas deben ser de dificultad universitaria y variada. No repitas preguntas.`;
};

type RawQuestion = Omit<Question, 'id' | 'section'>;

export const generateQuestions = async (testType: TestType, sections: string[], questionsPerSection: { [key: string]: number }): Promise<Question[]> => {
    // The Gemini API key is expected to be in `process.env.API_KEY`.
    // The GoogleGenAI constructor will handle it, and the app's error boundary
    // will catch any issues if the key is missing or invalid.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        console.log(`Generating questions for ${testType} using Gemini API`);
        const allQuestions: Question[] = [];
        let globalId = 1;

        for (const section of sections) {
            const count = questionsPerSection[section];
            if (count === 0) continue;

            const prompt = getPromptForTest(testType, section, count);
            console.log(`Requesting ${count} questions for section: ${section}`);

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        description: `Un array de exactamente ${count} preguntas.`,
                        items: questionSchema
                    },
                    temperature: 0.75, // For a balance of creativity and accuracy
                }
            });

            const jsonText = response.text;
            if (!jsonText) {
                console.error("No content in Gemini API response:", response);
                throw new Error("No se recibió contenido del modelo de IA.");
            }

            const sectionQuestions: RawQuestion[] = JSON.parse(jsonText);
            
            if (!Array.isArray(sectionQuestions)) {
                throw new Error("La respuesta del AI no fue un array JSON de preguntas.");
            }

            // Process and validate the received questions
            sectionQuestions.forEach(q => {
                if (!q || !q.text || !q.options || !Array.isArray(q.options) || q.options.length === 0 || !q.correctAnswerId || !q.explanation) {
                    console.warn("Skipping malformed question object from AI:", q);
                    return;
                }
                allQuestions.push({
                    ...q,
                    id: globalId++,
                    section: section,
                    options: shuffle(q.options) // Randomize answer options
                });
            });
        }
        
        if (allQuestions.length === 0) {
             throw new Error("El modelo de IA no pudo generar preguntas válidas. Inténtalo de nuevo.");
        }

        console.log(`Generated a total of ${allQuestions.length} questions.`);
        return shuffle(allQuestions); // Randomize the order of all questions
    } catch (error) {
        console.error("Error generating questions with Gemini API:", error);
        
        const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
        
        // Provide a more user-friendly error message for API key issues
        if (errorMessage.includes('API key not valid') || errorMessage.includes('API_KEY')) {
            throw new Error('La clave API de Google no es válida o no está configurada. El administrador debe verificar la variable de entorno API_KEY.');
        }

        throw new Error(`Error al comunicarse con el modelo de IA: ${errorMessage}`);
    }
};
