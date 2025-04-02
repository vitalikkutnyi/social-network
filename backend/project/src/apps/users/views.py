import base64
from datetime import timedelta
import os
import re
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
import qrcode
from io import BytesIO
from base64 import b64encode
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.db.models import Q


from . import serializers
from .models import CustomUser, Subscription, Chat, Message
from .serializers import UserProfileSerializer, UserProfileShortSerializer, \
    UserProfileEditSerializer, ChatSerializer, MessageSerializer
from ..posts.models import Post
from ..posts.serializers import PostSerializer


from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.response import Response
from rest_framework import status

import google.generativeai as genai
from django.conf import settings



class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response({"error": "Refresh token not provided"}, status=400)

        request.data['refresh'] = refresh_token  

        response = super().post(request, *args, **kwargs)

        new_access_token = response.data.get('access')

        if new_access_token:
            response.set_cookie(
                key='access_token',
                value=new_access_token,
                httponly=True,
                secure=True,
                samesite='None',
            )

        return response
        

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
                return JsonResponse({"error": "Паролі не збігаються"}, status=400)
            if CustomUser.objects.filter(username=username).exists():
                return JsonResponse({"error": "Користувач із таким іменем уже існує"}, status=400)

            user = CustomUser.objects.create_user(username=username, password=password)

            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            device, created = TOTPDevice.objects.get_or_create(
                user=user,
                name='default',
                defaults={'confirmed': True}  
            )
            if not created and not device.confirmed:
                device.confirmed = True
                device.save()

            secret_base32 = base64.b32encode(device.bin_key).decode('utf-8').replace('=', '')
            issuer = "lynquora.com"
            otpauth_url = f"otpauth://totp/{username}?secret={secret_base32}&issuer={issuer}"
            qr = qrcode.make(otpauth_url)
            buffered = BytesIO()
            qr.save(buffered, format="PNG")
            qr_code = b64encode(buffered.getvalue()).decode('utf-8')

            response = JsonResponse({
                "message": "Реєстрація успішна",
                "qr_code": qr_code,
                "auto_verified_2fa": True
            })

            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
            )
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='None',
            )

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
            otp_code = data.get('otp_code')

            if not username or not password:
                return JsonResponse({"error": "Заповніть усі поля"}, status=400)

            user = authenticate(username=username, password=password)
            if user is not None:
                device, created = TOTPDevice.objects.get_or_create(
                    user=user,
                    name='default',
                    defaults={'confirmed': True}
                )

                if not otp_code or not device.verify_token(otp_code):
                    return JsonResponse({"error": "Неправильний одноразовий код"}, status=400)
                
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)

                response = JsonResponse({
                    "message": "Вхід успішний",
                })

                response.set_cookie(
                    key='access_token',
                    value=access_token,
                    httponly=True,
                    secure=True, 
                    samesite='None',
                )

                response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    httponly=True,
                    secure=True,
                    samesite='None',
                )

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
        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')
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
    
    def get_posts(self, request, username):
        posts = Post.objects.filter(author__username=username).order_by('-is_pinned', '-created_at')
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    

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

    def delete(self, request):
        user = request.user
        Post.objects.filter(author=user).delete()
        Chat.objects.filter(Q(user1=user) | Q(user2=user)).delete()
        user.delete()
        return Response({"detail": "Account successfully deleted."}, status=status.HTTP_204_NO_CONTENT)


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


class ChatListAPIView(generics.ListAPIView):
    serializer_class = ChatSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Chat.objects.filter(Q(user1=user) | Q(user2=user))

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
            return Response({"message": "Чат уже існує."}, status=status.HTTP_400_BAD_REQUEST)

        chat = Chat.objects.create(user1=user1, user2=user2)
        serializer = ChatSerializer(chat, context={"request": request}) 
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

class ChatDetailAPIView(generics.RetrieveAPIView):
    serializer_class = ChatSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'

    def get_queryset(self):
        return Chat.objects.all()

    def get_object(self):
        chat = super().get_object()
        if self.request.user not in [chat.user1, chat.user2]:
            raise serializers.ValidationError("Ви не маєте доступу до цього чату.")
        return chat


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
        current_user = request.user
        chat_id = self.kwargs['chat_id']

        if instance.chat_id != int(chat_id):
            return Response({"error": "Message does not belong to this chat"}, status=403)

        if instance.chat.user1 == current_user or instance.chat.user2 == current_user:
            if instance.sender != current_user:
                instance.is_read = True
                instance.save()
                serializer = self.get_serializer(instance)
                return Response(serializer.data) 
            else:
                return Response(
                    {"detail": "Ви не можете позначити власне повідомлення як прочитане"},
                    status=403
                )
        return Response({"error": "Unauthorized"}, status=403)
    


class AIChatView(APIView):
    def post(self, request):
        user_message = request.data.get('message', '')
        
        if not user_message:
            return Response({"error": "Повідомлення не може бути порожнім"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            genai.configure(api_key=settings.GEMINI_API_KEY)

            model = genai.GenerativeModel('gemini-1.5-flash')

            chat = model.start_chat(history=[
                {"role": "user", "parts": [{"text": "Ти корисний ШІ-помічник на ім'я Google Gemini. Відповідай українською мовою. Форматуй відповіді у Markdown: використовуй **жирний шрифт** для важливих слів, додавай відступи для читабельності, але НЕ додавай зайвих відступів перед початком тексту чи списків. Наприклад, якщо я прошу список, він має виглядати так:\n1. Перший пункт\n2. Другий пункт\nбез зайвих нових рядків перед списком. Використовуй нумеровані списки або маркери (-), якщо потрібно перелічити елементи."}]},
                {"role": "model", "parts": [{"text": "Зрозумів! Я **Gemini**. Як я можу допомогти тобі сьогодні? Пиши запит, і я відповім структуровано. Використовую **Markdown** для форматування."}]}
            ])
            response = chat.send_message(user_message, generation_config={"max_output_tokens": 150})

            ai_message = response.text.strip().lstrip('\n')
            ai_message = re.sub(r'\n{2,}(?=\d+\.|- )', '\n', ai_message)

            return Response({"response": ai_message})

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

