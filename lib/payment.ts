import { TestType } from '../types';

const PAYMENT_KEY = 'ufmSimulatorPremiumAccess';
const SELECTED_TEST_KEY = 'selectedTestForPayment';

export const hasPremiumAccess = (): boolean => {
    if (typeof window === 'undefined') return false;
    try {
        return localStorage.getItem(PAYMENT_KEY) === 'true';
    } catch {
        return false;
    }
};

export const grantPremiumAccess = () => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(PAYMENT_KEY, 'true');
    } catch (error) {
        console.error("Could not grant premium access in localStorage", error);
    }
};

export const saveTestSelectionForPayment = (testType: TestType) => {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.setItem(SELECTED_TEST_KEY, testType);
    } catch (error) {
        console.error("Could not save test selection to sessionStorage", error);
    }
};

export const retrieveTestSelectionForPayment = (): TestType | null => {
     if (typeof window === 'undefined') return null;
    try {
        const testType = sessionStorage.getItem(SELECTED_TEST_KEY);
        sessionStorage.removeItem(SELECTED_TEST_KEY);
        if (testType === TestType.PAA || testType === TestType.OTIS) {
            return testType;
        }
        return null;
    } catch {
        return null;
    }
};
