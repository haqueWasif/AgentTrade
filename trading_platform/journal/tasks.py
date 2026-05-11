from celery import shared_task
from .models import JournalEntry
from agents.journal import JournalAgent

@shared_task
def analyze_new_journals():
    agent = JournalAgent()
    entries = JournalEntry.objects.order_by('-created_at')[:10]
    for entry in entries:
        result = agent.analyze({'journal_entry': entry.content})
        # Save or log result. You could store it in another model or send a notification.
        print(f"Entry {entry.id} mood {result['mood']} polarity {result['polarity']}")