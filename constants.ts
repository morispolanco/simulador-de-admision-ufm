
import { TestType, TestConfig } from './types';

export const TEST_CONFIG: { [key in TestType]: TestConfig } = {
    [TestType.PAA]: {
        questions: 60, // 20 per section for this MVP
        duration: 75,
        sections: ['Razonamiento Verbal', 'Razonamiento Matemático', 'Redacción Indirecta'],
        questionsPerSection: {
            'Razonamiento Verbal': 20,
            'Razonamiento Matemático': 20,
            'Redacción Indirecta': 20,
        },
    },
    [TestType.OTIS]: {
        questions: 75,
        duration: 30,
        sections: ['Razonamiento Deductivo/Inductivo', 'Léxico y Comprensión Verbal', 'Rapidez y Precisión Perceptiva'],
        questionsPerSection: {
            'Razonamiento Deductivo/Inductivo': 25,
            'Léxico y Comprensión Verbal': 25,
            'Rapidez y Precisión Perceptiva': 25,
        },
    }
};
