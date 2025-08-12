
import React, { useState, useEffect, useRef } from 'react';
import ClockIcon from './icons/ClockIcon';

interface TimerProps {
    initialTime: number; // in seconds
    onTimeUp: () => void;
}

const Timer: React.FC<TimerProps> = ({ initialTime, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const onTimeUpRef = useRef(onTimeUp);
    onTimeUpRef.current = onTimeUp;

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUpRef.current();
            return;
        }

        const timerId = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [timeLeft]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    const timeColor = timeLeft < 60 ? 'text-red-500' : timeLeft < 300 ? 'text-yellow-500' : 'text-green-500';
    
    return (
        <div className={`flex items-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 ${timeColor}`}>
            <ClockIcon className="h-6 w-6" />
            <span className="text-xl font-mono font-bold tracking-widest">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
        </div>
    );
};

export default Timer;
