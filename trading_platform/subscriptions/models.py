from django.db import models
from core.models import User

class Subscription(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    stripe_subscription_id = models.CharField(max_length=100)
    status = models.CharField(max_length=30)  # active, cancelled, past_due, etc.
    created_at = models.DateTimeField(auto_now_add=True)