import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Cargar la clave pública de Stripe
const stripePromise = loadStripe('pk_test_51QPVFQDVbpIbTH8h43Z7ufsEuMO0OmgTncrYmK2dV9dcPHPLG8YLXzJFz9Xnhoz39rvLjotPDOjsfyj5JJBT6r6o00IVFbfTKI'); // Reemplaza con tu clave pública de prueba

const StripePaymentModal = ({ show, handleClose, amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const handlePayment = async () => {
        setLoading(true);
        setErrorMessage('');

        if (!stripe || !elements) {
            setLoading(false);
            return;
        }

        const cardElement = elements.getElement(CardElement);

        // Crear el PaymentIntent desde tu servidor
        try {
            const response = await fetch('/api/payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });

            const { clientSecret } = await response.json();

            // Confirmar el pago
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (result.error) {
                setErrorMessage(result.error.message);
            } else if (result.paymentIntent.status === 'succeeded') {
                setPaymentSuccess(true);
            }
        } catch (error) {
            setErrorMessage('Payment failed. Please try again.');
        }

        setLoading(false);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-md p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Complete Your Payment</h2>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                        <i className="bi bi-x-lg text-2xl"></i>
                    </button>
                </div>
                {paymentSuccess ? (
                    <div className="text-center">
                        <h3 className="text-green-600 text-lg font-medium">Payment Successful!</h3>
                        <p>Thank you for your payment.</p>
                        <button
                            onClick={handleClose}
                            className="mt-4 px-4 py-2 bg-sky-800 text-white rounded-lg hover:bg-sky-900"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#424770',
                                        '::placeholder': { color: '#aab7c4' },
                                    },
                                    invalid: { color: '#9e2146' },
                                },
                            }}
                        />
                        {errorMessage && <p className="text-red-600 text-sm mt-2">{errorMessage}</p>}
                        <button
                            onClick={handlePayment}
                            disabled={loading || !stripe || !elements}
                            className={`mt-4 w-full px-4 py-2 text-white rounded-lg ${loading ? 'bg-gray-400' : 'bg-sky-800 hover:bg-sky-900'}`}
                        >
                            {loading ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export const StripeWrapper = ({ show, handleClose, amount }) => (
    <Elements stripe={stripePromise}>
        <StripePaymentModal show={show} handleClose={handleClose} amount={amount} />
    </Elements>
);
