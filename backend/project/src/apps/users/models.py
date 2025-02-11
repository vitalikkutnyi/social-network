from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    avatar= models.ImageField(upload_to="avatars/", blank=True, null=True)
    bio = models.CharField(max_length=255, blank=True, null=True)
