from rest_framework import serializers
from .models import CustomUser
from ..posts.serializers import PostSerializer


class UserProfileSerializer(serializers.ModelSerializer):
    posts = PostSerializer(many=True, read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'avatar', 'avatar_url', 'username', 'bio', 'is_active', 'date_joined', 'posts']

    def get_avatar_url(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None