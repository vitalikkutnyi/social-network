from django.contrib import admin
from .models import CustomUser, Subscription, Chat, Message
from django_otp.plugins.otp_totp.admin import TOTPDeviceAdmin
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.contrib import admin

class CustomTOTPDeviceAdmin(TOTPDeviceAdmin):
    def has_delete_permission(self, request, obj=None):
        return False

admin.site.unregister(TOTPDevice)
admin.site.register(TOTPDevice, CustomTOTPDeviceAdmin)

admin.site.register(CustomUser)
admin.site.register(Subscription)
admin.site.register(Chat)
admin.site.register(Message)