from django.urls import path
from .views import UserProfileView, register_view, login_view, logout_view

urlpatterns = [
    path('register/', register_view, name="register"),
    path('login/', login_view, name="login"),
    path('logout/', logout_view, name="logout"),
    path('profile/', UserProfileView.as_view(), name="profile"),
    path('profile/<int:user_id>/', UserProfileView.as_view(), name='user_profile'),
]