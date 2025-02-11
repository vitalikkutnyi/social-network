from django.urls import path
from .views import (RandomPostListAPIView, PostListCreateAPIView, PostDetailAPIView,
                    LikePostAPIView, CommentListCreateAPIView, CommentDeleteAPIView, RandomPostDetailAPIView)

urlpatterns = [
    path('posts/profile/create_post/', PostListCreateAPIView.as_view(), name="create_post"),
    path('posts/profile/<int:pk>/', PostDetailAPIView.as_view(), name="detail_post"),
    path('posts/profile/<int:post_id>/like/', LikePostAPIView.as_view(), name="like_post"),
    path('posts/profile/<int:post_id>/comments/', CommentListCreateAPIView.as_view(), name='comment_list_create'),
    path('posts/profile/<int:post_id>/comments/<int:pk>/delete/', CommentDeleteAPIView.as_view(), name='comment_delete'),
    path('posts/random_posts/', RandomPostListAPIView.as_view(), name='random_posts'),
    path('posts/random_posts/<int:pk>/', RandomPostDetailAPIView.as_view(), name='random_post_detail'),
    path('posts/random_posts/<int:post_id>/like/', LikePostAPIView.as_view(), name='random_post_like'),
    path('posts/random_posts/<int:post_id>/comments/', CommentListCreateAPIView.as_view(), name='random_post_comment_list_create'),
    path('posts/random_posts/<int:post_id>/comments/<int:pk>/delete/', CommentDeleteAPIView.as_view(), name='random_post_comment_delete'),
]