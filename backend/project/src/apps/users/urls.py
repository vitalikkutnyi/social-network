from django.urls import path
from .views import UserProfileView, register_view, login_view, logout_view, FollowUserAPIView, FollowersListAPIView, \
    FollowingListAPIView

urlpatterns = [
    path('register/', register_view, name="register"),
    path('login/', login_view, name="login"),
    path('logout/', logout_view, name="logout"),
    path('profile/', UserProfileView.as_view(), name="profile"),
    path('profile/<int:user_id>/', UserProfileView.as_view(), name='user_profile'),
    path('profile/<int:user_id>/follow/', FollowUserAPIView.as_view(), name="follow_user"),
    path('profile/<int:user_id>/followers/', FollowersListAPIView.as_view(), name="followers_list"),
    path('profile/<int:user_id>/following/', FollowingListAPIView.as_view(), name="following_list"),
]