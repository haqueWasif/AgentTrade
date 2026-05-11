from django.urls import path
from .views import CreateCheckoutSession

urlpatterns = [
    path('create-checkout/', CreateCheckoutSession.as_view(), name='create_checkout'),
]