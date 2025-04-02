from django.core.management.base import BaseCommand
from django.utils import timezone
from src.apps.your_app.models import Story

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        expired_stories = Story.objects.filter(expires_at__lte=timezone.now())
        count = expired_stories.count()
        expired_stories.delete()
        self.stdout.write(self.style.SUCCESS(f'Successfully deleted {count} expired stories'))