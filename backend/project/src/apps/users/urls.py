from django.urls import path
from .views import UserProfileView, register_view, login_view, logout_view, FollowUserAPIView, FollowersListAPIView, \
    FollowingListAPIView, UserSearchAPIView, UserProfileEditAPIView, ChatListAPIView, ChatDetailAPIView, \
    ChatDeleteAPIView, MessageListCreateAPIView, MessageReadAPIView, CreateChatAPIView

urlpatterns = [
    path('register/', register_view, name="register"),
    path('login/', login_view, name="login"),
    path('logout/', logout_view, name="logout"),
    path('profile/', UserProfileView.as_view(), name="profile"),
    path('profile/edit/', UserProfileEditAPIView.as_view(), name='edit_profile'),
    path('profile/<int:user_id>/', UserProfileView.as_view(), name='user_profile'),
    path('profile/<int:user_id>/follow/', FollowUserAPIView.as_view(), name="follow_user"),
    path('profile/<int:user_id>/followers/', FollowersListAPIView.as_view(), name="followers_list"),
    path('profile/<int:user_id>/following/', FollowingListAPIView.as_view(), name="following_list"),
    path('profile/search/', UserSearchAPIView.as_view(), name='user_search'),
    path('chats/create/', CreateChatAPIView.as_view(), name='create-chat'),
    path('chats/', ChatListAPIView.as_view(), name='chat_list'),
    path('chats/<int:pk>/', ChatDetailAPIView.as_view(), name='chat_detail'),
    path('chats/<int:pk>/delete/', ChatDeleteAPIView.as_view(), name='chat_delete'),
    path('chats/<int:chat_id>/messages/', MessageListCreateAPIView.as_view(), name='message-list'),
    path('chats/<int:chat_id>/messages/<int:pk>/read/', MessageReadAPIView.as_view(), name='message-read'),
]