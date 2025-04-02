from django.utils import timezone
import random
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.db.models import Count
from .models import Post, Like, Comment, CustomUser, Story, ViewedStory
from .serializers import LikeSerializer, SecondPostSerializer, PostSerializer, CommentSerializer, StorySerializer, ViewedStorySerializer
from ..users.models import CustomUser, Subscription

class PopularPostsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        posts = Post.objects.annotate(
            popularity=Count('likes') + Count('comments')
        ).filter(
            popularity__gt=0 
        ).order_by('-popularity')
        
        serializer = SecondPostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)
    

class HomePagePostListAPIView(generics.ListAPIView):
    serializer_class = SecondPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        following_users = Subscription.objects.filter(follower=user).values_list('following', flat=True)
        following_posts = Post.objects.filter(author__in=following_users).order_by('-created_at')
        other_posts = list(Post.objects.exclude(author__in=following_users))
        random.shuffle(other_posts)
        return list(following_posts) + other_posts


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
    

class PostUpdateAPIView(generics.UpdateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        post = super().get_object()
        if post.author.username != self.kwargs['username']:
            raise PermissionDenied("Ви не можете редагувати цей пост.")
        if post.is_repost:
            raise PermissionDenied("Репости не можна редагувати.")
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
    
    def perform_destroy(self, instance):
        instance.delete()
    

class PinPostAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, username, pk):
        post = get_object_or_404(Post, id=pk, author__username=username)
        if request.user != post.author:
            return Response(
                {"detail": "Ви можете закріплювати лише свої дописи."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        post.is_pinned = not post.is_pinned
        post.save()
        return Response(
            {"detail": "Успішно.", "is_pinned": post.is_pinned},
            status=status.HTTP_200_OK
        )
    

class RepostPostAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, username, post_id):
        original_post = get_object_or_404(Post, id=post_id)
        
        if original_post.is_repost:
            return Response(
                {"detail": "Репостити репости не дозволено."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        new_post = Post(
            author=request.user,
            text=original_post.text,
            image=original_post.image,
            video=original_post.video,
            audio=original_post.audio,
            is_repost=True,
            original_author=original_post.author
        )
        new_post.save()

        serializer = PostSerializer(new_post, context={"request": request})
        response_data = serializer.data
        response_data['reposts_count'] = original_post.reposts_count()

        return Response(response_data, status=status.HTTP_201_CREATED)


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


class LikesPostAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, username, post_id):
        post = get_object_or_404(Post, id=post_id, author__username=username)
        likes = Like.objects.filter(post=post)
        serializer = LikeSerializer(likes, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)


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


class PostSearchAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        query = request.query_params.get("query", "")
        if not query:
            return Response({"detail": "Запит не вказано."}, status=400)
        posts = Post.objects.filter(text__icontains=query).order_by('-created_at')
        serializer = PostSerializer(posts, many=True, context={"request": request})
        return Response(serializer.data)
    

class StoryListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = StorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        username = self.request.query_params.get("username")
        queryset = Story.objects.filter(expires_at__gt=timezone.now()).order_by('created_at')
        if username:
            try:
                queryset = queryset.filter(author__username=username)
            except Exception as e:
                print(f"Error filtering stories by username {username}: {e}")
                return Story.objects.none()
        return queryset

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class StoryDetailAPIView(generics.RetrieveDestroyAPIView):
    serializer_class = StorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Story.objects.filter(expires_at__gt=timezone.now())

    def get_object(self):
        story_id = self.kwargs.get("pk")
        story = get_object_or_404(Story, id=story_id)
        if story.is_expired():
            raise generics.get_object_or_404_exception(story)
        return story

    def perform_destroy(self, instance):
        if instance.author != self.request.user:
            raise PermissionDenied("Ви можете видаляти лише свої сторіз.")
        instance.delete()


class ViewedStoryListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        viewer_id = request.query_params.get("viewer_id")
        username = request.query_params.get("username")
        if not viewer_id or not username:
            return Response({"error": "viewer_id and username are required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            viewed_stories = ViewedStory.objects.filter(
                user_id=viewer_id,
                story__author__username=username,
                story__expires_at__gt=timezone.now()
            )
            serializer = ViewedStorySerializer(viewed_stories, many=True)
            print(f"GET Viewed stories for viewer_id={viewer_id}, username={username}: {list(viewed_stories.values())}")
            return Response(serializer.data)
        except Exception as e:
            print(f"Error fetching viewed stories: {e}")
            return Response({"error": "Failed to fetch viewed stories"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        story_id = request.data.get("story_id")
        user_id = request.data.get("user_id")
        if not story_id or user_id is None:
            return Response({"error": "story_id and user_id are required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = CustomUser.objects.get(id=user_id)
            story = Story.objects.get(id=story_id)
            viewed_story, created = ViewedStory.objects.get_or_create(user=user, story_id=story_id)
            if created:
                print(f"Created ViewedStory: user_id={user_id}, story_id={story_id}")
            else:
                print(f"ViewedStory already exists: user_id={user_id}, story_id={story_id}")
            return Response({"status": "viewed"}, status=status.HTTP_201_CREATED)
        except CustomUser.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        except Story.DoesNotExist:
            return Response({"error": "Story not found"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error creating viewed story: {e}")
            return Response({"error": "Failed to create viewed story"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ViewedStoryDeleteView(generics.DestroyAPIView):
    serializer_class = ViewedStorySerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        story_id = self.kwargs["pk"]
        return get_object_or_404(ViewedStory, story_id=story_id, user=self.request.user)

    def delete(self, request, *args, **kwargs):
        viewed_story = self.get_object()
        viewed_story.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)