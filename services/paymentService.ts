// Este servicio se comunica con un endpoint de backend para crear una Intención de Pago en Stripe.
// Deberás implementar este endpoint en tu servidor.
export const createPaymentIntent = async (): Promise<{ clientSecret: string }> => {
    // En un backend real, pasarías el monto y la moneda.
    // El backend crearía un PaymentIntent con Stripe y devolvería su client_secret.
    const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // El cuerpo es opcional en este diseño, pero podrías enviar
        // un ID de producto o información similar.
        body: JSON.stringify({
             // El monto se define en el backend para mayor seguridad
        }),
    });

    if (!response.ok) {
        const { error } = await response.json().catch(() => ({ error: 'Error de red o respuesta no válida.' }));
        throw new Error(error || 'Falló al crear la intención de pago.');
    }

    const { clientSecret } = await response.json();
    if (!clientSecret) {
        throw new Error('No se recibió un client secret del servidor.');
    }

    return { clientSecret };
};
