import random
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Post, Like, Comment
from .serializers import PostSerializer, CommentSerializer
from ..users.models import Subscription


class HomePagePostListAPIView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        following_users = Subscription.objects.filter(follower=user).values_list('following', flat=True)
        following_posts = Post.objects.filter(author__in=following_users).order_by('-created_at')
        other_posts = list(Post.objects.exclude(author__in=following_users))
        random.shuffle(other_posts)
        return list(following_posts) + other_posts


class HomePagePostDetailAPIView(generics.RetrieveAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]


class PostListCreateAPIView(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.author != request.user:
            return Response({"detail": "Не дозволено редагувати чужий пост"}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.author != request.user:
            return Response({"detail": "Не дозволено видаляти чужий пост"}, status=status.HTTP_403_FORBIDDEN)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LikePostAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        post = get_object_or_404(Post, id=post_id)
        like, created = Like.objects.get_or_create(user=request.user, post=post)

        if not created:
            like.delete()
            return Response({"message": "Лайк видалено"}, status=200)

        return Response({"message": "Лайк додано"}, status=201)


class CommentListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs["post_id"]
        return Comment.objects.filter(post_id=post_id)

    def perform_create(self, serializer):
        post = Post.objects.get(id=self.kwargs["post_id"])
        serializer.save(author=self.request.user, post=post)


class CommentDeleteAPIView(generics.DestroyAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(author=self.request.user)