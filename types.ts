
export enum TestType {
    PAA = 'PAA',
    OTIS = 'OTIS'
}

export enum TestMode {
    SIMULATION = 'Simulacro',
    PRACTICE = 'Práctica'
}

export interface QuestionOption {
    id: string; // e.g., 'A', 'B', 'C'
    text: string;
}

export interface Question {
    id: number;
    section: string;
    text: string;
    options: QuestionOption[];
    correctAnswerId: string;
    explanation: string;
}

export interface TestResult {
    id: number;
    testType: TestType;
    testMode: TestMode;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    incorrectAnswers: number;
    timeTaken: number; // in seconds
    date: string;
    answers: { [key: number]: string };
    questions: Question[];
}

export interface TestConfig {
    questions: number;
    duration: number; // in minutes
    sections: string[];
    questionsPerSection: { [key: string]: number };
}
