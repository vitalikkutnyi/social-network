from rest_framework import serializers
from .models import CustomUser, Subscription
from ..posts.serializers import PostSerializer


class UserProfileSerializer(serializers.ModelSerializer):
    posts = PostSerializer(many=True, read_only=True)
    avatar_url = serializers.SerializerMethodField()
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'avatar', 'avatar_url', 'username', 'bio', 'is_active', 'followers_count', 'following_count', 'date_joined', 'posts', 'is_following']

    def get_avatar_url(self, obj):
        if obj.avatar:
            return obj.avatar.url
        return None

    def get_followers_count(self, obj):
        return Subscription.objects.filter(following=obj).count()

    def get_following_count(self, obj):
        return Subscription.objects.filter(follower=obj).count()

    def get_is_following(self, obj):
        request = self.context.get('request', None)
        if request and request.user.is_authenticated:
            return request.user.following.filter(following=obj).exists()
        return False


class UserProfileShortSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'avatar_url', 'is_following']

    def get_avatar_url(self, obj):
        return obj.avatar.url if obj.avatar else None

    def get_is_following(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return request.user.following.filter(following=obj).exists()
        return False


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'