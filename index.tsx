import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// IMPORTANT: Replace this with your actual Stripe publishable key.
// You can find this key in your Stripe Dashboard.
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51PbiUKRxYfLdRwPAy8U9ZtWn3t3Z8j8y8p8w8y8Y8R8q8Y8w8y8p8w8Y8R8q8Y8w8y8p8w8Y8R8q8Y8w';

if (!STRIPE_PUBLISHABLE_KEY || !STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
  console.error('Stripe publishable key is not set or is invalid. Payments will not work.');
  // In a real app, you might want to render an error message to the user.
}

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  </React.StrictMode>
);