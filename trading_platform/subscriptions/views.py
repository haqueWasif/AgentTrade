from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

import stripe


class CreateCheckoutSession(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not settings.STRIPE_SECRET_KEY or not settings.STRIPE_PRICE_ID:
            return Response({
                "detail": (
                    "Stripe checkout is not configured. Add STRIPE_SECRET_KEY "
                    "and STRIPE_PRICE_ID to your backend .env file."
                )
            })

        stripe.api_key = settings.STRIPE_SECRET_KEY

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price": settings.STRIPE_PRICE_ID,
                    "quantity": 1,
                }
            ],
            mode="subscription",
            success_url=f"{settings.FRONTEND_URL}/dashboard?subscription=success",
            cancel_url=f"{settings.FRONTEND_URL}/subscription?subscription=cancelled",
            customer_email=request.user.email,
        )

        return Response({
            "checkout_session_id": session.id,
            "checkout_url": session.url,
        })