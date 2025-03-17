from django.urls import path
from .views import (HomePagePostListAPIView, HomePagePostDetailAPIView, PostDestroyAPIView, PostListCreateAPIView, PostDetailAPIView,
                    LikePostAPIView, CommentListCreateAPIView, CommentDeleteAPIView, PostUpdateAPIView)

urlpatterns = [
    path('profile/<str:username>/posts/create/', PostListCreateAPIView.as_view(), name="create_post"),
    path('profile/<str:username>/posts/<int:pk>/', PostDetailAPIView.as_view(), name="detail_post"),
    path('profile/<str:username>/posts/<int:pk>/update/', PostUpdateAPIView.as_view(), name='post_update'),
    path('profile/<str:username>/posts/<int:pk>/delete/', PostDestroyAPIView.as_view(), name='post_update'),
    path('profile/<str:username>/posts/<int:post_id>/like/', LikePostAPIView.as_view(), name="like_post"),
    path('profile/<str:username>/posts/<int:post_id>/comments/', CommentListCreateAPIView.as_view(), name='comment_list_create'),
    path('profile/<str:username>/posts/<int:post_id>/comments/<int:pk>/delete/', CommentDeleteAPIView.as_view(), name='comment_delete'),
    path('homepage/', HomePagePostListAPIView.as_view(), name='homepage_posts'),
    path('homepage/<int:pk>/', HomePagePostDetailAPIView.as_view(), name='homepage_post_detail'),
    path('homepage/<int:post_id>/like/', LikePostAPIView.as_view(), name='homepage_post_like'),
    path('homepage/<int:post_id>/comments/', CommentListCreateAPIView.as_view(), name='homepage_post_comment_list_create'),
    path('homepage/<int:post_id>/comments/<int:pk>/delete/', CommentDeleteAPIView.as_view(), name='homepage_post_comment_delete'),
]