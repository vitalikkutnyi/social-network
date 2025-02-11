from rest_framework import serializers
from .models import Post, Like, Comment


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__'
        read_only_fields = ['user', 'post']


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['author', 'post']


class PostSerializer(serializers.ModelSerializer):
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

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