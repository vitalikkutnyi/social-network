from rest_framework import serializers
from .models import CustomUser, Subscription, Message, Chat
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
            return Subscription.objects.filter(follower=request.user, following=obj).exists()
        return False


class UserProfileEditSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False)
    username = serializers.CharField(required=False)
    bio = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'avatar', 'bio']


class SubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subscription
        fields = '__all__'


class MessageSerializer(serializers.ModelSerializer):
    message_id = serializers.IntegerField(source='id', read_only=True)
    sender_name = serializers.CharField(source='sender.username', read_only=True)
    sender_avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['message_id', 'sender_name', 'sender_avatar_url', 'text', 'sent_at', 'is_read']

    def get_sender_avatar_url(self, obj):
        return obj.sender.avatar.url if obj.sender.avatar else None


class ChatSerializer(serializers.ModelSerializer):
    other_user = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Chat
        fields = ["id", "other_user", "avatar_url", "last_message", "created_at"]

    def get_other_user(self, obj):
        request = self.context.get('request')
        if obj.user1 == request.user:
            return obj.user2.username
        return obj.user1.username
    
    def get_avatar_url(self, obj):
        request_user = self.context["request"].user
        other_user = obj.user2 if obj.user1 == request_user else obj.user1
        return other_user.avatar.url if other_user.avatar else None

    def get_last_message(self, obj):
        last_message = obj.messages.order_by('sent_at').last()
        return MessageSerializer(last_message).data if last_message else None