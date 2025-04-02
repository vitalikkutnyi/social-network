from django.urls import path
from .views import (PopularPostsView, HomePagePostListAPIView, LikesPostAPIView, PinPostAPIView, PostDestroyAPIView, PostListCreateAPIView, PostDetailAPIView,
                    LikePostAPIView, CommentListCreateAPIView, CommentDeleteAPIView, PostSearchAPIView, PostUpdateAPIView, RepostPostAPIView, StoryDetailAPIView, StoryListCreateAPIView, ViewedStoryDeleteView, ViewedStoryListCreateView)

urlpatterns = [
    path('popular-posts/', PopularPostsView.as_view(), name="popular_posts"),
    path('profile/<str:username>/posts/create/', PostListCreateAPIView.as_view(), name="create_post"),
    path('profile/<str:username>/posts/<int:pk>/', PostDetailAPIView.as_view(), name="detail_post"),
    path('profile/<str:username>/posts/<int:pk>/update/', PostUpdateAPIView.as_view(), name='post_update'),
    path('profile/<str:username>/posts/<int:pk>/delete/', PostDestroyAPIView.as_view(), name='delete'),
    path('profile/<str:username>/posts/<int:pk>/pin/', PinPostAPIView.as_view(), name="pin_post"),
    path('profile/<str:username>/posts/<int:post_id>/like/', LikePostAPIView.as_view(), name="like_post"),
    path('profile/<str:username>/posts/<int:post_id>/likes/', LikesPostAPIView.as_view(), name="likes_post"),
    path('profile/<str:username>/posts/<int:post_id>/comments/', CommentListCreateAPIView.as_view(), name='comment_list_create'),
    path('profile/<str:username>/posts/<int:post_id>/comments/<int:pk>/delete/', CommentDeleteAPIView.as_view(), name='comment_delete'),
    path('profile/<str:username>/posts/<int:post_id>/repost/', RepostPostAPIView.as_view(), name='repost_post'),
    path('posts/search/', PostSearchAPIView.as_view(), name='post-search'),
    path('stories/', StoryListCreateAPIView.as_view(), name='story-list-create'),
    path('stories/<int:pk>/', StoryDetailAPIView.as_view(), name='story-detail'),
    path("viewed-stories/", ViewedStoryListCreateView.as_view(), name="viewed-story-list-create"),
    path("viewed-stories/<int:pk>/", ViewedStoryDeleteView.as_view(), name="viewed-story-delete"),
    path('', HomePagePostListAPIView.as_view(), name='homepage_posts'),
]