import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import API from '../services/api';

export default function SubscriptionPage() {
  async function subscribe() {
    try {
      const res = await API.post('subscriptions/create-checkout/');
      window.location.href = `https://checkout.stripe.com/pay/${res.data.checkout_session_id}`;
    } catch {
      alert('Error creating subscription session');
    }
  }

  return (
    <Card title="Premium Subscription">
      <p className="text-gray-300 mb-4">
        Unlock advanced analytics and unlimited alerts with our premium plan.
      </p>
      <Button onClick={subscribe}>Subscribe for $9.99/month</Button>
    </Card>
  );
}