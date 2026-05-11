from django.db import models
from core.models import User, Instrument

class JournalEntry(models.Model):
    trader = models.ForeignKey(User, on_delete=models.CASCADE)
    instrument = models.ForeignKey(Instrument, on_delete=models.SET_NULL, null=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Journal entry {self.id} by {self.trader.username}"