import React, { useState } from 'react';
import { TestType } from '../types';
import { useStripe } from '@stripe/react-stripe-js';

interface PaymentModalProps {
    onClose: () => void;
    testType: TestType | null;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ onClose, testType }) => {
    const stripe = useStripe();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
        if (!stripe) {
            setError('Stripe no está listo. Por favor espera un momento.');
            return;
        }

        // Esta es la clave del precio que creaste en tu Dashboard de Stripe.
        // Asegúrate de configurarla como una variable de entorno.
        const priceId = process.env.STRIPE_PRICE_ID;
        if (!priceId) {
            setError('Error de configuración: El ID de precio de Stripe no está disponible.');
            return;
        }

        setIsProcessing(true);
        setError(null);

        const { error: stripeError } = await stripe.redirectToCheckout({
            lineItems: [{ price: priceId, quantity: 1 }],
            mode: 'payment',
            // El ?payment=success se usará para detectar un pago exitoso al volver.
            successUrl: `${window.location.origin}${window.location.pathname}?payment=success`,
            cancelUrl: `${window.location.origin}${window.location.pathname}`,
        });

        if (stripeError) {
            setError(stripeError.message || 'Ocurrió un error inesperado.');
            setIsProcessing(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full m-4 transform transition-all animate-fade-in-up"
                onClick={e => e.stopPropagation()}
            >
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Acceso Premium</h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Desbloquea el <span className="font-semibold text-blue-500">Modo Simulacro</span> para el examen {testType} con un único pago seguro.
                    </p>
                    <p className="text-4xl font-extrabold my-4 text-gray-800 dark:text-gray-100">$29.00 <span className="text-base font-normal text-gray-500">USD</span></p>
                </div>

                <div className="space-y-4">
                    {error && <div className="text-red-500 text-sm text-center bg-red-100 dark:bg-red-900/50 p-3 rounded-md">{error}</div>}

                    <div className="pt-2">
                        <button 
                            onClick={handleCheckout}
                            disabled={!stripe || isProcessing}
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex justify-center items-center transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Redirigiendo...
                                </>
                            ) : `Pagar con Stripe y Empezar`}
                        </button>
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="w-full mt-3 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
                 <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6 flex items-center justify-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                     Serás redirigido a la página segura de Stripe para completar tu pago.
                 </p>
            </div>
        </div>
    );
};

export default PaymentModal;