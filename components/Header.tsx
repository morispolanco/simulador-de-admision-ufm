
import React from 'react';

interface HeaderProps {
    onNavigate: (view: 'home' | 'history') => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigate }) => {
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
                        <svg className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m-9-5.747h18"/>
                        </svg>
                        <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">UFM Simulador</span>
                    </div>
                    <nav>
                        <button
                            onClick={() => onNavigate('home')}
                            className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition"
                        >
                            Inicio
                        </button>
                        <button
                            onClick={() => onNavigate('history')}
                            className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition"
                        >
                            Historial
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
