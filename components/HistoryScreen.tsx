
import React, { useState, useEffect } from 'react';
import { TestResult } from '../types';
import { getHistory, clearHistory } from '../lib/localStorage';

interface HistoryScreenProps {
    onViewResult: (result: TestResult) => void;
    onSwitchView: (view: 'results' | 'home') => void;
}

const HistoryScreen: React.FC<HistoryScreenProps> = ({ onViewResult, onSwitchView }) => {
    const [history, setHistory] = useState<TestResult[]>([]);

    useEffect(() => {
        setHistory(getHistory());
    }, []);

    const handleViewResult = (result: TestResult) => {
        onViewResult(result);
        onSwitchView('results');
    };

    const handleClearHistory = () => {
        if (window.confirm('¿Estás seguro de que quieres borrar todo tu historial? Esta acción no se puede deshacer.')) {
            clearHistory();
            setHistory([]);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Historial de Exámenes</h1>
                {history.length > 0 && (
                     <button
                        onClick={handleClearHistory}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
                    >
                        Borrar Historial
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
                    <p className="text-gray-500 dark:text-gray-400">No has completado ningún examen todavía.</p>
                    <button onClick={() => onSwitchView('home')} className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">
                        Empezar un Examen
                    </button>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {history.map(result => (
                            <li key={result.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150">
                                <div className="flex items-center justify-between flex-wrap">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{result.testType} - {result.testMode}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(result.date).toLocaleString('es-GT')}
                                        </p>
                                    </div>
                                    <div className="mx-4 my-2 text-center">
                                        <p className={`text-xl font-bold ${result.score >= 70 ? 'text-green-500' : result.score >= 50 ? 'text-yellow-500' : 'text-red-500'}`}>
                                            {result.score.toFixed(1)}%
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Puntuación</p>
                                    </div>
                                    <button
                                        onClick={() => handleViewResult(result)}
                                        className="bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-semibold py-2 px-4 rounded-lg transition"
                                    >
                                        Ver Detalles
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default HistoryScreen;
