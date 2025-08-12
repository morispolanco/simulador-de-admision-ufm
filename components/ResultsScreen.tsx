
import React from 'react';
import { TestResult } from '../types';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';

interface ResultsScreenProps {
    result: TestResult;
    onRetry: () => void;
    onHome: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ result, onRetry, onHome }) => {
    const scoreColor = result.score >= 70 ? 'text-green-500' : result.score >= 50 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 text-center">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-2">Resultados del Examen</h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{result.testType} - {result.testMode}</p>
                
                <div className="mb-8">
                    <p className="text-6xl font-bold" style={{ color: scoreColor.replace('text-', '').replace('-500', '') }}>
                        {result.score.toFixed(1)}%
                    </p>
                    <p className="text-xl font-medium text-gray-700 dark:text-gray-300">Puntuación Final</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-8">
                    <div>
                        <p className="text-3xl font-bold text-blue-500">{result.totalQuestions}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Preguntas</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-green-500">{result.correctAnswers}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Correctas</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-red-500">{result.incorrectAnswers}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Incorrectas</p>
                    </div>
                     <div>
                        <p className="text-3xl font-bold text-purple-500">{new Date(result.timeTaken * 1000).toISOString().substr(14, 5)}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Tiempo (MM:SS)</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onClick={onRetry} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
                        Volver a Intentar
                    </button>
                    <button onClick={onHome} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105">
                        Ir al Inicio
                    </button>
                </div>
            </div>

            <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Revisión de Respuestas</h2>
                <div className="space-y-6">
                    {result.questions.map((q, index) => {
                        const userAnswerId = result.answers[index];
                        const isCorrect = userAnswerId === q.correctAnswerId;
                        return (
                            <div key={q.id} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0">
                                <div className="flex items-start">
                                    <div className="mr-4 mt-1">
                                        {isCorrect ? <CheckIcon className="h-6 w-6 text-green-500" /> : <XIcon className="h-6 w-6 text-red-500" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 dark:text-gray-200">{q.id}. {q.text}</p>
                                        <div className="mt-2 space-y-1 text-sm">
                                            {q.options.map(opt => {
                                                const isUserAnswer = opt.id === userAnswerId;
                                                const isCorrectAnswer = opt.id === q.correctAnswerId;
                                                let optionClass = 'text-gray-600 dark:text-gray-400';
                                                if (isCorrectAnswer) optionClass = 'text-green-600 dark:text-green-400 font-bold';
                                                if (isUserAnswer && !isCorrect) optionClass = 'text-red-600 dark:text-red-400 line-through';
                                                
                                                return (
                                                  <p key={opt.id} className={optionClass}>
                                                    {opt.id}) {opt.text}
                                                    {isUserAnswer && isCorrect && <span className="ml-2 text-green-600 dark:text-green-400">(Tu respuesta)</span>}
                                                    {isUserAnswer && !isCorrect && <span className="ml-2 text-red-600 dark:text-red-400">(Tu respuesta)</span>}
                                                    {isCorrectAnswer && !isUserAnswer && <span className="ml-2 text-green-600 dark:text-green-400">(Respuesta correcta)</span>}
                                                  </p>
                                                );
                                            })}
                                        </div>
                                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/40 border-l-4 border-yellow-400 rounded-r-md">
                                            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">Explicación:</p>
                                            <p className="text-sm text-yellow-700 dark:text-yellow-300">{q.explanation}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default ResultsScreen;
