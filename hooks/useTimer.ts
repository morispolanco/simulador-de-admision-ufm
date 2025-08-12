
import { useState, useEffect, useRef, useCallback } from 'react';

export const useTimer = (initialTime: number, onEnd: () => void, isRunning: boolean = true) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const callbackRef = useRef(onEnd);

    useEffect(() => {
        callbackRef.current = onEnd;
    }, [onEnd]);

    useEffect(() => {
        if (!isRunning) {
            return;
        }

        if (timeLeft <= 0) {
            callbackRef.current();
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft(prevTime => prevTime - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft, isRunning]);
    
    const resetTimer = useCallback(() => {
        setTimeLeft(initialTime);
    }, [initialTime]);

    return { timeLeft, resetTimer };
};
