import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { authFetch, getToken } from '../../utils/auth'
import Container from '../../components/ui/Container'

function CheckoutForm({ clientSecret, orderId }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const card = elements.getElement(CardElement);
        if (!stripe || !card) return;
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, { payment_method: { card } });
        setLoading(false);
        if (error) alert(error.message);
        else alert('Payment successful!');
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-md p-4 bg-white rounded">
            <CardElement />
            <button disabled={loading} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded">Pay</button>
        </form>
    )
}

export default function CheckoutPage() {
    const router = useRouter();
    const { courseId } = router.query;
    const [clientSecret, setClientSecret] = useState(null);
    const [stripePromise, setStripePromise] = useState(null);

    useEffect(() => {
        if (!courseId) return;
        const run = async () => {
            const token = getToken();
            if (!token) return alert('Please login first')
            const res = await authFetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/create-intent/${courseId}`, { method: 'POST' });
            const data = await res.json();
            if (data.clientSecret) setClientSecret(data.clientSecret);
            // load stripe publishable key from env
            const pub = process.env.NEXT_PUBLIC_STRIPE_PUB;
            if (pub) setStripePromise(loadStripe(pub));
        }
        run();
    }, [courseId]);

    if (!clientSecret) return <Container>Preparing payment...</Container>

    return (
        <Container>
            {stripePromise ? (
                <Elements stripe={stripePromise}>
                    <CheckoutForm clientSecret={clientSecret} />
                </Elements>
            ) : (
                <div className="p-4 bg-white rounded">Set NEXT_PUBLIC_STRIPE_PUB in frontend .env.local to enable Stripe Elements.</div>
            )}
        </Container>
    )
}
