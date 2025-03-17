import random
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from .models import Post, Like, Comment, CustomUser
from .serializers import PostSerializer, CommentSerializer
from ..users.models import CustomUser, Subscription


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
    permission_classes = [permissions.IsAuthenticated]


class PostListCreateAPIView(generics.ListCreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Post.objects.all()
        username = self.request.query_params.get("username")
        if username:
            queryset = queryset.filter(author__username=username)
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        username = self.kwargs.get("username")
        post_id = self.kwargs.get("pk") 
        return get_object_or_404(Post, author__username=username, id=post_id)

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
    

class PostUpdateAPIView(generics.UpdateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        post = super().get_object()
        if post.author.username != self.kwargs['username']:
            raise PermissionDenied("Ви не можете редагувати цей пост.")
        return post
    

class PostDestroyAPIView(generics.DestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        post = super().get_object()
        if post.author.username != self.kwargs['username']:
            raise PermissionDenied("Ви не можете видаляти цей пост.")
        return post


class LikePostAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PostSerializer

    def post(self, request, username, post_id):
        post = get_object_or_404(Post, id=post_id)
        user = request.user
        like = Like.objects.filter(user=user, post=post).first()
        if like:
            like.delete()
            return Response({"message": "Лайк видалено"}, status=status.HTTP_200_OK)
        else:
            Like.objects.create(user=user, post=post)
            return Response({"message": "Лайк додано"}, status=status.HTTP_201_CREATED)


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

    def get_object(self):
        post_id = self.kwargs["post_id"]
        comment_id = self.kwargs["pk"]
        comment = get_object_or_404(
            Comment,
            id=comment_id,
            post_id=post_id,
        )
        return comment

    def perform_destroy(self, instance):
        post = instance.post
        if instance.author != self.request.user and (self.request.user != post.author and not self.request.user.is_staff):
            raise permissions.PermissionDenied("Ви можете видаляти лише свої коментарі або коментарі до власного посту.")
        instance.delete()
