# Generated by Django 5.1.6 on 2025-03-20 16:04

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0005_post_is_pinned'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='is_repost',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='post',
            name='original_author',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='reposted_posts', to=settings.AUTH_USER_MODEL),
        ),
    ]
