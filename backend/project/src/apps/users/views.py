from datetime import timedelta
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
import json
from rest_framework import generics, permissions, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from . import serializers
from .models import CustomUser, Subscription, Chat, Message
from .serializers import UserProfileSerializer, UserProfileShortSerializer, \
    UserProfileEditSerializer, ChatSerializer, MessageSerializer
from ..posts.models import Post
from ..posts.serializers import PostSerializer


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get("refresh_token") 
        if not refresh_token:
            return Response({"error": "Refresh token не знайдено"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            return Response({"access": access_token})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
def register_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            password2 = data.get('password2')

            if not username or not password or not password2:
                return JsonResponse({"error": "Усі поля є обов'язковими"}, status=400)
            if password != password2:
                return JsonResponse({"error": "Паролі не співпадають"}, status=400)
            if CustomUser.objects.filter(username=username).exists():
                return JsonResponse({"error": "Користувач із таким іменем уже існує"}, status=400)

            user = CustomUser.objects.create_user(username=username, password=password)

            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token

            response = JsonResponse({
                "message": "Реєстрація успішна",
                "access_token": str(access_token),
                'refresh_token': str(refresh)
            })

            return response

        except json.JSONDecodeError:
            return JsonResponse({"error": "Некоректний JSON"}, status=400)

    return JsonResponse({"error": "Метод не дозволений"}, status=405)


@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')

            if not username or not password:
                return JsonResponse({"error": "Заповніть усі поля"}, status=400)

            user = authenticate(username=username, password=password)
            if user is not None:
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)

                response = JsonResponse({
                    "message": "Вхід успішний",
                    "access_token": access_token,
                    'refresh_token': str(refresh)
                })

                return response
            else:
                return JsonResponse({"error": "Неправильний логін або пароль"}, status=400)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Неправильний формат JSON"}, status=400)

    return JsonResponse({"error": "Метод не дозволений"}, status=405)


@csrf_exempt
def logout_view(request):
    if request.method == "POST":
        response = JsonResponse({"message": "Вихід успішний"})
        cookies = request.COOKIES.keys()  
        for cookie in cookies:
            response.delete_cookie(cookie) 
        if 'access_token' in request.session:
            del request.session['access_token']
        logout(request)
        return response

    return JsonResponse({"error": "Метод не дозволений"}, status=405)


class UserProfileView(generics.RetrieveAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        username = self.kwargs.get('username')
        if username:
            return get_object_or_404(CustomUser, username=username)
        else:
            return self.request.user

    def get_posts(self, obj):
            posts = Post.objects.filter(author=obj).order_by('-created_at')
            return PostSerializer(posts, many=True).data


class UserProfileEditAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileEditSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        data = request.data.copy()
        if "avatar" in request.FILES:
            data["avatar"] = request.FILES["avatar"]
        serializer = UserProfileEditSerializer(request.user, data=data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FollowUserAPIView(APIView):
    serializer_class = UserProfileShortSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, username):
        following_user = get_object_or_404(CustomUser, username=username)

        if request.user == following_user:
            return Response({"error": "Не можна підписатися на себе"}, status=status.HTTP_400_BAD_REQUEST)

        follow, created = Subscription.objects.get_or_create(follower=request.user, following=following_user)

        if not created:
            follow.delete()
            serializer = self.serializer_class(following_user, context={"request": request})
            return Response({"message": "Відписка успішна", "user": serializer.data }, status=status.HTTP_200_OK)

        serializer = self.serializer_class(following_user, context={"request": request})
        return Response({"message": "Підписка успішна", "user": serializer.data }, status=status.HTTP_201_CREATED)


class FollowersListAPIView(generics.ListAPIView):
    serializer_class = UserProfileShortSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        username = self.kwargs["username"]
        user = CustomUser.objects.get(username=username)
        return CustomUser.objects.filter(following__following=user).distinct()


class FollowingListAPIView(generics.ListAPIView):
    serializer_class = UserProfileShortSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        username = self.kwargs["username"]
        user = CustomUser.objects.get(username=username)
        return CustomUser.objects.filter(followers__follower=user).distinct()


class UserSearchAPIView(generics.ListAPIView):
    serializer_class = UserProfileShortSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get("q", "").strip()
        if query:
            return CustomUser.objects.filter(username__icontains=query)
        return CustomUser.objects.none()


class CreateChatAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        user1 = request.user
        user2_username = request.data.get('user2')

        try:
            user2 = CustomUser.objects.get(username=user2_username)
        except CustomUser.DoesNotExist:
            return Response({"error": "Користувача не знайдено."}, status=status.HTTP_404_NOT_FOUND)

        existing_chat = Chat.objects.filter(user1=user1, user2=user2) | Chat.objects.filter(user1=user2, user2=user1)

        if existing_chat.exists():
            return Response({"message": "Чат вже існує."}, status=status.HTTP_400_BAD_REQUEST)

        chat = Chat.objects.create(user1=user1, user2=user2)
        return Response({"message": "Чат успішно створено.", "chat_id": chat.id}, status=status.HTTP_201_CREATED)


class ChatListAPIView(generics.ListAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(user1=user) | Chat.objects.filter(user2=user)


class ChatDetailAPIView(generics.RetrieveAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]
    queryset = Chat.objects.all()


class ChatDeleteAPIView(generics.DestroyAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(user1=user) | Chat.objects.filter(user2=user)


class MessageListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        chat_id = self.kwargs['chat_id']
        chat = Chat.objects.get(id=chat_id)

        if self.request.user not in [chat.user1, chat.user2]:
            raise serializers.ValidationError("Ви не маєте доступу до цього чату.")

        return Message.objects.filter(chat_id=chat_id)

    def perform_create(self, serializer):
        chat_id = self.kwargs['chat_id']
        chat = Chat.objects.get(id=chat_id)

        if self.request.user not in [chat.user1, chat.user2]:
            raise serializers.ValidationError("Неможливо надіслати повідомлення.")

        serializer.save(chat=chat, sender=self.request.user)


class MessageReadAPIView(generics.UpdateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Message.objects.all()

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.chat.user1 == request.user or instance.chat.user2 == request.user:
            instance.is_read = True
            instance.save()
            return Response({"status": "read"})
        return Response({"error": "Unauthorized"}, status=403)