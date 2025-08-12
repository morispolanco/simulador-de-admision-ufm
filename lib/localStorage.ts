
import { TestResult } from '../types';

const HISTORY_KEY = 'ufmTestSimulatorHistory';

export const getHistory = (): TestResult[] => {
    try {
        const historyJson = localStorage.getItem(HISTORY_KEY);
        if (historyJson) {
            return JSON.parse(historyJson);
        }
    } catch (error) {
        console.error("Could not parse history from localStorage", error);
        return [];
    }
    return [];
};

export const saveResultToHistory = (result: TestResult) => {
    try {
        const history = getHistory();
        // Add new result to the beginning of the array
        const newHistory = [result, ...history];
        localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
        console.error("Could not save result to localStorage", error);
    }
};

export const clearHistory = () => {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error("Could not clear history from localStorage", error);
    }
};
