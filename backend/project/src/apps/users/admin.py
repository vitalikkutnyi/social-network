from django.contrib import admin

from .models import CustomUser, Subscription, Chat, Message

admin.site.register(CustomUser)
admin.site.register(Subscription)
admin.site.register(Chat)
admin.site.register(Message)