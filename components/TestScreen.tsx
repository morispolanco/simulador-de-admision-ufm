
import React, { useState, useEffect, useCallback } from 'react';
import { TestType, TestMode, Question } from '../types';
import QuestionCard from './QuestionCard';
import Timer from './Timer';
import { TEST_CONFIG } from '../constants';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import ArrowRightIcon from './icons/ArrowRightIcon';

interface TestScreenProps {
    testType: TestType;
    testMode: TestMode;
    questions: Question[];
    onFinishTest: (answers: { [key: number]: string }, timeTaken: number) => void;
}

const TestScreen: React.FC<TestScreenProps> = ({ testType, testMode, questions, onFinishTest }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const totalDuration = TEST_CONFIG[testType].duration * 60; // in seconds
    
    const [time, setTime] = useState(0);
    const [startTime] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime]);

    const handleTimeUp = useCallback(() => {
        if (testMode === TestMode.SIMULATION) {
            const timeTaken = Math.floor((Date.now() - startTime) / 1000);
            onFinishTest(answers, timeTaken);
        }
    }, [testMode, onFinishTest, answers, startTime]);

    const handleSelectAnswer = (questionIndex: number, optionId: string) => {
        setAnswers(prev => ({ ...prev, [questionIndex]: optionId }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };
    
    const handleSubmit = () => {
        if (window.confirm('¿Estás seguro de que quieres finalizar el examen?')) {
            const timeTaken = Math.floor((Date.now() - startTime) / 1000);
            onFinishTest(answers, timeTaken);
        }
    };
    
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 mb-6">
                <div className="flex justify-between items-center mb-4 flex-wrap">
                    <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{testType} - {testMode}</h1>
                    {testMode === TestMode.SIMULATION && <Timer initialTime={totalDuration} onTimeUp={handleTimeUp} />}
                    {testMode === TestMode.PRACTICE && <div className="text-lg font-semibold">Tiempo transcurrido: {new Date(time * 1000).toISOString().substr(11, 8)}</div>}
                </div>
                <div className="mb-4">
                     <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{questions[currentQuestionIndex]?.section}</p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-center mt-1 text-sm font-medium">Pregunta {currentQuestionIndex + 1} de {questions.length}</p>
                </div>
            </div>

            <QuestionCard
                question={questions[currentQuestionIndex]}
                selectedOption={answers[currentQuestionIndex]}
                onSelectOption={(optionId) => handleSelectAnswer(currentQuestionIndex, optionId)}
                showExplanation={testMode === TestMode.PRACTICE}
            />

            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={handlePrev}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                    Anterior
                </button>
                
                {currentQuestionIndex === questions.length - 1 ? (
                    <button
                        onClick={handleSubmit}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition shadow-lg"
                    >
                        Finalizar Examen
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                        Siguiente
                        <ArrowRightIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default TestScreen;
