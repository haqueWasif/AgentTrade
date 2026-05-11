from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import stripe
from django.conf import settings
from .models import Subscription

stripe.api_key = 'sk_test_your_secret_key'

class CreateCheckoutSession(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Create a Stripe Checkout Session
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price': 'price_id_of_your_plan',
                'quantity': 1,
            }],
            mode='subscription',
            success_url='https://your-domain.com/success',
            cancel_url='https://your-domain.com/cancel',
            customer_email=request.user.email,
        )
        return Response({'checkout_session_id': session.id})