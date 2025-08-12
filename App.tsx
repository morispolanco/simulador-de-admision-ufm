import React, { useState, useCallback } from 'react';
import { TestType, TestMode, Question, TestResult } from './types';
import { TEST_CONFIG } from './constants';
import HomeScreen from './components/HomeScreen';
import TestScreen from './components/TestScreen';
import ResultsScreen from './components/ResultsScreen';
import HistoryScreen from './components/HistoryScreen';
import Header from './components/Header';
import { generateQuestions } from './services/geminiService';
import { saveResultToHistory } from './lib/localStorage';

type AppView = 'home' | 'test' | 'results' | 'history' | 'loading';

const App: React.FC = () => {
    const [view, setView] = useState<AppView>('home');
    const [currentTest, setCurrentTest] = useState<{ type: TestType; mode: TestMode } | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [lastResult, setLastResult] = useState<TestResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const startTest = useCallback(async (type: TestType, mode: TestMode) => {
        setView('loading');
        setError(null);
        try {
            const config = TEST_CONFIG[type];
            const generatedQuestions = await generateQuestions(type, config.sections, config.questionsPerSection);
            setQuestions(generatedQuestions);
            setCurrentTest({ type, mode });
            setView('test');
        } catch (err) {
            console.error(err);
            setError('Error al generar las preguntas. Por favor, inténtalo de nuevo.');
            setView('home');
        }
    }, []);

    const finishTest = useCallback((answers: { [key: number]: string }, timeTaken: number) => {
        if (!currentTest) return;

        let correctCount = 0;
        questions.forEach((q, index) => {
            if (answers[index] === q.correctAnswerId) {
                correctCount++;
            }
        });

        const result: TestResult = {
            id: Date.now(),
            testType: currentTest.type,
            testMode: currentTest.mode,
            score: (correctCount / questions.length) * 100,
            totalQuestions: questions.length,
            correctAnswers: correctCount,
            incorrectAnswers: questions.length - correctCount,
            timeTaken,
            date: new Date().toISOString(),
            answers,
            questions,
        };

        setLastResult(result);
        saveResultToHistory(result);
        setView('results');
    }, [questions, currentTest]);

    const renderContent = () => {
        switch (view) {
            case 'loading':
                return (
                    <div className="flex flex-col items-center justify-center h-full pt-20">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="mt-4 text-lg font-semibold">Generando tu examen... Por favor espera.</p>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>
                );
            case 'test':
                if (currentTest) {
                    return (
                        <TestScreen
                            testType={currentTest.type}
                            testMode={currentTest.mode}
                            questions={questions}
                            onFinishTest={finishTest}
                        />
                    );
                }
                return null;
            case 'results':
                if (lastResult) {
                    return <ResultsScreen result={lastResult} onRetry={() => startTest(lastResult.testType, lastResult.testMode)} onHome={() => setView('home')} />;
                }
                return null;
            case 'history':
                return <HistoryScreen onViewResult={setLastResult} onSwitchView={setView} />;
            case 'home':
            default:
                return <HomeScreen onStartTest={startTest} />;
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <Header onNavigate={setView} />
            <main className="flex-grow container mx-auto p-4 sm:p-6 md:p-8">
                {renderContent()}
            </main>
            <footer className="text-center p-4 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                © {new Date().getFullYear()} Simulador de Admisión UFM. Creado con fines educativos.
            </footer>
        </div>
    );
};

export default App;