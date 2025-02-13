from django.urls import path
from .views import (HomePagePostListAPIView, HomePagePostDetailAPIView, PostListCreateAPIView, PostDetailAPIView,
                    LikePostAPIView, CommentListCreateAPIView, CommentDeleteAPIView)

urlpatterns = [
    path('posts/profile/create_post/', PostListCreateAPIView.as_view(), name="create_post"),
    path('posts/profile/<int:pk>/', PostDetailAPIView.as_view(), name="detail_post"),
    path('posts/profile/<int:post_id>/like/', LikePostAPIView.as_view(), name="like_post"),
    path('posts/profile/<int:post_id>/comments/', CommentListCreateAPIView.as_view(), name='comment_list_create'),
    path('posts/profile/<int:post_id>/comments/<int:pk>/delete/', CommentDeleteAPIView.as_view(), name='comment_delete'),
    path('homepage/', HomePagePostListAPIView.as_view(), name='random_posts'),
    path('homepage/<int:pk>/', HomePagePostDetailAPIView.as_view(), name='random_post_detail'),
    path('homepage/<int:post_id>/like/', LikePostAPIView.as_view(), name='random_post_like'),
    path('homepage/<int:post_id>/comments/', CommentListCreateAPIView.as_view(), name='random_post_comment_list_create'),
    path('homepage/<int:post_id>/comments/<int:pk>/delete/', CommentDeleteAPIView.as_view(), name='random_post_comment_delete'),
]