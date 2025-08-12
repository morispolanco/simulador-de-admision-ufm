import React, { useState, useEffect } from 'react';
import { TestType, TestMode } from '../types';
import { hasPremiumAccess, grantPremiumAccess, saveTestSelectionForPayment, retrieveTestSelectionForPayment } from '../lib/payment';
import BookOpenIcon from './icons/BookOpenIcon';
import LockIcon from './icons/LockIcon';
import PaymentModal from './PaymentModal';

interface HomeScreenProps {
    onStartTest: (type: TestType, mode: TestMode) => void;
    error: string | null;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartTest, error }) => {
    const [selectedTest, setSelectedTest] = useState<TestType | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [hasPaid, setHasPaid] = useState(hasPremiumAccess());
    const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('payment') === 'success') {
            grantPremiumAccess();
            setHasPaid(true);
            const testToStart = retrieveTestSelectionForPayment();
            
            if (testToStart) {
                setPaymentSuccessMessage('¡Pago exitoso! Tu examen de simulación comenzará en breve.');
                setTimeout(() => {
                    onStartTest(testToStart, TestMode.SIMULATION);
                }, 3000); 
            } else {
                 setPaymentSuccessMessage('¡Pago exitoso! Ahora tienes acceso a todos los exámenes de simulación.');
            }

            window.history.replaceState(null, '', window.location.pathname);
        }
    }, [onStartTest]);

    const handleSelectTest = (type: TestType) => {
        setSelectedTest(type);
    };

    const handleStart = (mode: TestMode) => {
        if (!selectedTest) return;
        
        if (mode === TestMode.PRACTICE) {
            onStartTest(selectedTest, mode);
            return;
        }

        if (mode === TestMode.SIMULATION) {
            if (hasPaid) {
                onStartTest(selectedTest, mode);
            } else {
                saveTestSelectionForPayment(selectedTest);
                setIsPaymentModalOpen(true);
            }
        }
    };

    const TestCard: React.FC<{ type: TestType; title: string; description: string; }> = ({ type, title, description }) => (
        <button
            onClick={() => handleSelectTest(type)}
            className={`p-6 rounded-xl shadow-lg transition-all duration-300 text-left w-full h-full flex flex-col ${selectedTest === type ? 'bg-blue-600 text-white ring-4 ring-blue-300' : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
        >
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <p className="text-base flex-grow">{description}</p>
        </button>
    );

    return (
        <>
            <div className="flex flex-col items-center justify-center text-center">
                <div className="max-w-4xl w-full">
                    <div className="mb-8">
                        <BookOpenIcon className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white">Simulador de Admisión UFM</h1>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                            Prepárate para tus pruebas PAA y OTIS. Elige un examen para comenzar.
                        </p>
                    </div>

                    {(error || paymentSuccessMessage) && (
                         <div className={`border px-4 py-3 rounded-lg relative mb-6 ${error ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'}`} role="alert">
                            <strong className="font-bold">{error ? 'Error' : 'Éxito'}: </strong>
                            <span className="block sm:inline">{error || paymentSuccessMessage}</span>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                        <TestCard type={TestType.PAA} title="Prueba de Aptitud Académica (PAA)" description="Evalúa tus habilidades en razonamiento verbal, matemático y redacción indirecta." />
                        <TestCard type={TestType.OTIS} title="Test de Aptitud OTIS" description="Mide tu agilidad mental y capacidad de razonamiento con 75 preguntas en 30 minutos." />
                    </div>

                    {selectedTest && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl animate-fade-in-up w-full max-w-lg mx-auto">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Elige un modo para {selectedTest}</h2>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => handleStart(TestMode.PRACTICE)}
                                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 shadow-md"
                                >
                                    Modo Práctica
                                </button>
                                <button
                                    onClick={() => handleStart(TestMode.SIMULATION)}
                                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 shadow-md"
                                >
                                    {!hasPaid && <LockIcon className="h-5 w-5" />}
                                    Modo Simulacro
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {isPaymentModalOpen && (
                <PaymentModal
                    testType={selectedTest}
                    onClose={() => setIsPaymentModalOpen(false)}
                />
            )}
        </>
    );
};

export default HomeScreen;