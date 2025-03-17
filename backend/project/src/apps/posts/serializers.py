from rest_framework import serializers
from .models import Post, Like, Comment


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__'
        read_only_fields = ['user', 'post']


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
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    author = serializers.CharField(source='author.username', read_only=True)  

    class Meta:
        model = Post
        fields = '__all__'
        read_only_fields = ['author']

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