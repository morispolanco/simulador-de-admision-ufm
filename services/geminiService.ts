import { Question, TestType } from '../types';
import { shuffle } from '../utils/shuffle';

// Define the JSON schema as a string for the prompt
const jsonSchemaString = `
{
    "text": "string (El texto de la pregunta.)",
    "options": [
        {
            "id": "string (Letra de la opción, e.g., A, B, C, D, E)",
            "text": "string (El texto de la opción.)"
        }
    ],
    "correctAnswerId": "string (La letra ID de la respuesta correcta.)",
    "explanation": "string (Una explicación clara y concisa de por qué la respuesta es correcta.)"
}`;

const getPromptForTest = (testType: TestType, section: string, count: number): string => {
    const basePrompt = (testType === TestType.PAA)
        ? `Genera ${count} preguntas de opción múltiple para la sección "${section}" de la prueba PAA (Prueba de Aptitud Académica) de la UFM.`
        : `Genera ${count} preguntas de opción múltiple para un examen tipo OTIS, enfocado en "${section}".`;

    return `${basePrompt} Las preguntas deben ser de dificultad universitaria y variada. No repitas preguntas.
    
IMPORTANTE: Tu respuesta DEBE ser un array JSON válido que contenga exactamente ${count} objetos de pregunta. No incluyas texto, explicaciones o markdown fuera del array JSON. El array debe comenzar con '[' y terminar con ']'.
Cada objeto de pregunta en el array debe seguir estrictamente este esquema:
${jsonSchemaString}
`;
};

type RawQuestion = Omit<Question, 'id' | 'section'>;

export const generateQuestions = async (testType: TestType, sections: string[], questionsPerSection: { [key: string]: number }): Promise<Question[]> => {
    // Check for API Key at the beginning of the function call.
    if (!process.env.CEREBRAS_API_KEY) {
        throw new Error('La clave de API de Cerebras no está configurada. El administrador debe configurar la variable de entorno CEREBRAS_API_KEY.');
    }
    const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;

    try {
        console.log(`Generating questions for ${testType} using Cerebras API`);
        const allQuestions: Question[] = [];
        let globalId = 1;

        for (const section of sections) {
            const count = questionsPerSection[section];
            if (count === 0) continue;

            const prompt = getPromptForTest(testType, section, count);
            console.log(`Requesting ${count} questions for section: ${section}`);

            const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CEREBRAS_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-4-scout-17b-16e-instruct",
                    stream: false,
                    messages: [{"content": prompt, "role": "user"}],
                    temperature: 0.7,
                    max_tokens: -1,
                    seed: Math.floor(Math.random() * 100000),
                    top_p: 1
                })
            });

            if (!response.ok) {
                const errorBody = await response.text();
                console.error("Cerebras API error response:", errorBody);
                throw new Error(`Error de la API de Cerebras: ${response.status} ${response.statusText}. ${errorBody}`);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (!content) {
                console.error("No content in Cerebras API response:", data);
                throw new Error("No se recibió contenido del modelo de IA.");
            }

            // The model might wrap the JSON in markdown or add extra text. This cleans it up.
            let jsonText = content.trim();
            const startIndex = jsonText.indexOf('[');
            const endIndex = jsonText.lastIndexOf(']');
            if (startIndex !== -1 && endIndex !== -1) {
                jsonText = jsonText.substring(startIndex, endIndex + 1);
            } else {
                 throw new Error("La respuesta del modelo de IA no contenía un array JSON válido.");
            }

            const sectionQuestions: RawQuestion[] = JSON.parse(jsonText);
            
            if (!Array.isArray(sectionQuestions)) {
                throw new Error("La respuesta del AI no fue un array JSON de preguntas.");
            }

            sectionQuestions.forEach(q => {
                if (!q || !q.text || !q.options || !Array.isArray(q.options) || q.options.length === 0 || !q.correctAnswerId || !q.explanation) {
                    console.warn("Skipping malformed question object from AI:", q);
                    return;
                }
                allQuestions.push({
                    ...q,
                    id: globalId++,
                    section: section,
                    options: shuffle(q.options)
                });
            });
        }
        
        if (allQuestions.length === 0) {
             throw new Error("El modelo de IA no pudo generar preguntas válidas. Inténtalo de nuevo.");
        }

        console.log(`Generated a total of ${allQuestions.length} questions.`);
        return shuffle(allQuestions);
    } catch (error) {
        console.error("Error generating questions with Cerebras API:", error);
        
        const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
        
        if (errorMessage.toLowerCase().includes('api key')) {
             throw new Error('La clave de API de Cerebras no está configurada. El administrador debe configurar la variable de entorno CEREBRAS_API_KEY.');
        }

        throw new Error(`Error al procesar la respuesta del modelo de IA: ${errorMessage}`);
    }
};