from django.contrib.auth import authenticate, login, logout
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework import generics, permissions
from rest_framework.permissions import IsAuthenticated
from .models import CustomUser
from .serializers import UserProfileSerializer
from ..posts.models import Post
from ..posts.serializers import PostSerializer


@csrf_exempt
def register_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            avatar = data.get("avatar")
            username = data.get("username")
            bio = data.get("bio")
            password = data.get("password")
            password2 = data.get("password2")

            if not username or not password or not password2:
                return JsonResponse({"error": "Усі поля є обов'язковими"}, status=400)
            if password != password2:
                return JsonResponse({"error": "Паролі не співпадають"}, status=400)
            if CustomUser.objects.filter(username=username).exists():
                return JsonResponse({"error": "Користувач уже існує"}, status=400)

            avatar_file = None
            if avatar:
                avatar_content = ContentFile(avatar.encode())
                avatar_file = default_storage.save(f'avatars/{username}_avatar.jpg', avatar_content)

            CustomUser.objects.create_user(username=username, password=password, bio=bio, avatar=avatar_file)

            user = authenticate(username=username, password=password)
            if user:
                login(request, user)
                return JsonResponse({"message": "Реєстрація успішна", "user_id": user.id})
            return JsonResponse({"error": "Помилка автентифікації"}, status=500)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Некоректний JSON"}, status=400)

    return JsonResponse({"error": "Метод не дозволений"}, status=405)



@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get("username")
            password = data.get("password")

            if not username or not password:
                return JsonResponse({"error": "Заповніть усі поля"}, status=400)

            user = authenticate(username=username, password=password)
            if user is not None:
                login(request, user)
                return JsonResponse({"message": "Вхід успішний", "user": username})
            else:
                return JsonResponse({"error": "Неправильний логін або пароль"}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Неправильний формат JSON"}, status=400)

    return JsonResponse({"error": "Метод не дозволений"}, status=405)


@csrf_exempt
def logout_view(request):
    if request.method == "POST":
        logout(request)
        return JsonResponse({"message": "Вихід успішний"})

    return JsonResponse({"error": "Метод не дозволений"}, status=405)


class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_object(self):
        user_id = self.kwargs.get('user_id')
        if user_id:
            return get_object_or_404(CustomUser, id=user_id)
        else:
            return self.request.user


def get_posts(self, obj):
        posts = Post.objects.filter(author=obj).order_by('-created_at')
        return PostSerializer(posts, many=True).data