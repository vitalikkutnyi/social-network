from rest_framework import serializers
from .models import Post, Like, Comment, Story, ViewedStory


class LikeSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Like
        fields = ["id", "user_id", "username", "avatar_url", "post", "created_at"]
        read_only_fields = ["id", "user_id", "username", "avatar_url", "post", "created_at"]

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if obj.user.avatar and request:
            return request.build_absolute_uri(obj.user.avatar.url)
        return None


class CommentSerializer(serializers.ModelSerializer):    
    author = serializers.CharField(source='author.username', read_only=True)
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ['id', 'text', 'created_at', 'avatar', 'author']
        read_only_fields = ['author', 'post']

    def get_avatar(self, obj):
        request = self.context.get("request")
        if obj.author.avatar:
            avatar_url = obj.author.avatar.url
            return request.build_absolute_uri(avatar_url) if request else avatar_url
        return None


class PostSerializer(serializers.ModelSerializer):
    is_liked_by_user = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    author = serializers.CharField(source='author.username', read_only=True)
    original_author_username = serializers.CharField(source='original_author.username', read_only=True, allow_null=True)

    class Meta:
        model = Post
        fields = [
            'id', 'text', 'image', 'video', 'audio', 'created_at',
            'is_pinned', 'is_repost', 'original_author_username',
            'likes_count', 'comments_count', 'reposts_count', 'comments',
            'author', 'is_liked_by_user'
        ]
        read_only_fields = ['author', 'created_at', 'likes_count', 'comments_count', 'reposts_count']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def validate_image(self, value):
        if value and not value.content_type.startswith('image'):
            raise serializers.ValidationError("Файл має бути зображенням!")
        return value

    def validate_video(self, value):
        if value and not value.content_type.startswith('video'):
            raise serializers.ValidationError("Файл має бути відео!")
        return value

    def validate_audio(self, value):
        if value and not value.content_type.startswith('audio'):
            raise serializers.ValidationError("Файл має бути аудіофайлом!")
        return value
    
    def get_is_liked_by_user(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False
    

class SecondPostSerializer(serializers.ModelSerializer):
    is_liked_by_user = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    comments = CommentSerializer(many=True, read_only=True)
    author = serializers.CharField(source='author.username', read_only=True)
    original_author_username = serializers.CharField(source='original_author.username', read_only=True, allow_null=True)
    is_editable = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'text', 'image', 'video', 'audio', 'created_at',
            'is_repost', 'original_author_username', 
            'likes_count', 'comments_count', 'reposts_count', 'comments',
            'author', 'is_liked_by_user', 'is_editable'
        ]
        read_only_fields = ['author', 'created_at', 'reposts_count']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_comments_count(self, obj):
        return obj.comments.count()

    def get_is_liked_by_user(self, obj):
        request = self.context.get("request")
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False
    
    def get_is_editable(self, obj):
        return False

    def validate_image(self, value):
        if value and not value.content_type.startswith('image'):
            raise serializers.ValidationError("Файл має бути зображенням!")
        return value

    def validate_video(self, value):
        if value and not value.content_type.startswith('video'):
            raise serializers.ValidationError("Файл має бути відео!")
        return value

    def validate_audio(self, value):
        if value and not value.content_type.startswith('audio'):
            raise serializers.ValidationError("Файл має бути аудіофайлом!")
        return value
    

class StorySerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='author.username', read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Story
        fields = ['id', 'author', 'avatar_url', 'image', 'video', 'created_at', 'expires_at']
        read_only_fields = ['author', 'created_at', 'expires_at']

    def get_avatar_url(self, obj):
        request = self.context.get("request")
        if obj.author.avatar and request:
            return request.build_absolute_uri(obj.author.avatar.url)
        return None

    def validate(self, data):
        image = data.get('image')
        video = data.get('video')
        if not image and not video:
            raise serializers.ValidationError("Необхідно додати зображення або відео.")
        if image and video:
            raise serializers.ValidationError("Можна додати лише один тип медіа.")
        if image and not image.content_type.startswith('image'):
            raise serializers.ValidationError("Файл має бути зображенням!")
        if video and not video.content_type.startswith('video'):
            raise serializers.ValidationError("Файл має бути відео!")
        return data
    

class ViewedStorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ViewedStory
        fields = ["story_id", "user_id", "viewed_at"]