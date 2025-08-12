import { Question, TestType } from '../types';
import { shuffle } from '../utils/shuffle';

// The check for the key is moved inside the `generateQuestions` function
// to avoid crashing the app on load.

const getPromptForTest = (testType: TestType, section: string, count: number): string => {
    const basePrompt = (testType === TestType.PAA)
        ? `Genera ${count} preguntas de opción múltiple para la sección "${section}" de la prueba PAA (Prueba de Aptitud Académica) de la UFM.`
        : `Genera ${count} preguntas de opción múltiple para un examen tipo OTIS, enfocadas en "${section}".`;

    // A detailed prompt to guide the model to produce valid JSON.
    return `${basePrompt} Las preguntas deben ser de dificultad universitaria y variada. No repitas preguntas.

IMPORTANTE: Tu respuesta DEBE ser únicamente un array de objetos JSON válido, sin ningún otro texto, explicación o marcado markdown. El array debe ajustarse a la siguiente estructura TypeScript:

interface QuestionOption {
    id: string; // Letra de la opción (A, B, C, D, E)
    text: string;
}

interface Question {
    text: string;
    options: QuestionOption[]; // Un arreglo de 4 a 5 posibles respuestas.
    correctAnswerId: string; // La letra ID de la respuesta correcta.
    explanation: string; // Una explicación clara y concisa de por qué la respuesta es correcta.
}

Genera el array JSON con exactamente ${count} objetos que sigan la estructura de \`Question\`.
`;
};

// Define a type for the expected raw question from the API, which lacks id and section.
type RawQuestion = Omit<Question, 'id' | 'section'>;

export const generateQuestions = async (testType: TestType, sections: string[], questionsPerSection: { [key: string]: number }): Promise<Question[]> => {
    const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;

    if (!CEREBRAS_API_KEY) {
        // This error is now thrown when the user tries to start a test, not on app load.
        // The error message is more user-friendly and actionable for the person deploying the app.
        throw new Error("La clave de API de Cerebras no está configurada. El administrador debe configurar la variable de entorno CEREBRAS_API_KEY.");
    }

    try {
        console.log(`Generating questions for ${testType} using Cerebras API`);
        const allQuestions: Question[] = [];
        let globalId = 1;

        for (const section of sections) {
            const count = questionsPerSection[section];
            if (count === 0) continue;

            const prompt = getPromptForTest(testType, section, count);
            console.log(`Requesting ${count} questions for section: ${section}`);

            // Use fetch to call the Cerebras API
            const apiResponse = await fetch('https://api.cerebras.ai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CEREBRAS_API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-4-scout-17b-16e-instruct",
                    stream: false,
                    messages: [{"content": prompt, "role": "user"}],
                    temperature: 0.7, // For a balance of creativity and accuracy
                    max_tokens: 8192, // Generous token limit for large question sets
                    top_p: 1,
                    seed: Math.floor(Math.random() * 100000) // Random seed for variability
                })
            });

            if (!apiResponse.ok) {
                const errorBody = await apiResponse.text();
                console.error("Cerebras API error response:", errorBody);
                throw new Error(`La solicitud a la API de Cerebras falló con el estado ${apiResponse.status}`);
            }

            const responseData = await apiResponse.json();
            
            const jsonText = responseData.choices?.[0]?.message?.content?.trim();
            if (!jsonText) {
                console.error("No content in Cerebras API response:", responseData);
                throw new Error("No se recibió contenido del modelo de IA.");
            }

            // Clean the response in case the model wraps it in markdown code fences
            const cleanedJsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');

            let sectionQuestions: RawQuestion[];
            try {
                sectionQuestions = JSON.parse(cleanedJsonText);
            } catch (e) {
                 console.error("Failed to parse JSON from Cerebras API.", "Response:", cleanedJsonText, "Error:", e);
                 throw new Error("El modelo de IA devolvió una respuesta con formato incorrecto.");
            }
            
            if (!Array.isArray(sectionQuestions)) {
                throw new Error("La respuesta del AI no fue un array JSON de preguntas.");
            }

            // Process the received questions and add them to the main list
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
        console.error("Error generating questions with Cerebras API:", error);
        
        // Re-throw other errors to be handled by the caller, ensuring it's an Error instance
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Ocurrió un error inesperado al generar las preguntas.');
    }
};