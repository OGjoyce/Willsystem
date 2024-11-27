<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\PaymentIntent;

class StripeController extends Controller
{
    /**
     * Create a PaymentIntent and return its client secret.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createPaymentIntent(Request $request)
    {
        // Configurar la clave secreta de Stripe
        Stripe::setApiKey(env('STRIPE_SECRET'));

        // Validar el monto recibido
        $request->validate([
            'amount' => 'required|integer|min:50', // Mínimo 50 centavos ($0.50)
        ]);

        try {
            // Crear el PaymentIntent
            $paymentIntent = PaymentIntent::create([
                'amount' => $request->amount, // El monto debe estar en centavos
                'currency' => 'usd', // Cambia a la moneda que desees
                'payment_method_types' => ['card'], // Métodos de pago permitidos
            ]);

            return response()->json([
                'clientSecret' => $paymentIntent->client_secret,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
