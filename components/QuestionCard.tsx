
import React, { useState } from 'react';
import { Question } from '../types';

interface QuestionCardProps {
    question: Question;
    selectedOption: string | undefined;
    onSelectOption: (optionId: string) => void;
    showExplanation?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, selectedOption, onSelectOption, showExplanation = false }) => {
    const [revealExplanation, setRevealExplanation] = useState(false);

    if (!question) {
        return <div className="text-center p-8">Cargando pregunta...</div>;
    }
    
    const handleOptionClick = (optionId: string) => {
        onSelectOption(optionId);
        if (showExplanation) {
            // Delay reveal to allow selection animation
            setTimeout(() => setRevealExplanation(true), 300);
        }
    };
    
    const getOptionClass = (optionId: string) => {
        let baseClass = 'w-full text-left p-4 my-2 rounded-lg border-2 transition-all duration-200 cursor-pointer';
        
        if (!selectedOption) {
            return `${baseClass} border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900/50`;
        }

        const isSelected = selectedOption === optionId;
        const isCorrect = question.correctAnswerId === optionId;

        if (showExplanation && revealExplanation) {
             if (isCorrect) return `${baseClass} bg-green-200 dark:bg-green-800 border-green-500 ring-2 ring-green-400`;
             if (isSelected && !isCorrect) return `${baseClass} bg-red-200 dark:bg-red-800 border-red-500`;
             return `${baseClass} border-gray-300 dark:border-gray-600`;
        }

        if (isSelected) {
            return `${baseClass} bg-blue-500 border-blue-600 text-white`;
        }
        
        return `${baseClass} border-gray-300 dark:border-gray-600 hover:bg-blue-100 dark:hover:bg-blue-900/50`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-lg animate-fade-in">
            <h2 className="text-xl md:text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-100">{question.id}. {question.text}</h2>
            
            <div className="space-y-3">
                {question.options.map(option => (
                    <button
                        key={option.id}
                        onClick={() => handleOptionClick(option.id)}
                        className={getOptionClass(option.id)}
                        disabled={showExplanation && revealExplanation}
                    >
                        <span className="font-bold mr-3">{option.id})</span>
                        {option.text}
                    </button>
                ))}
            </div>

            {showExplanation && revealExplanation && (
                 <div className="mt-6 p-4 bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 rounded-r-lg animate-fade-in-up">
                    <h4 className="font-bold text-yellow-800 dark:text-yellow-200">Explicación:</h4>
                    <p className="mt-2 text-gray-700 dark:text-gray-300">{question.explanation}</p>
                </div>
            )}
        </div>
    );
};

export default QuestionCard;
