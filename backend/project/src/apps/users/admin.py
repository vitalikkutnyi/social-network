from django.contrib import admin

from .models import CustomUser, Subscription

admin.site.register(CustomUser)
admin.site.register(Subscription)