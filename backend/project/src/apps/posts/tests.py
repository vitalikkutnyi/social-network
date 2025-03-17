from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework import status
from rest_framework.reverse import reverse
from rest_framework.test import APITestCase
from rest_framework.exceptions import ValidationError

from src.apps.posts.models import Post, Like, Comment
from src.apps.posts.serializers import LikeSerializer, CommentSerializer, PostSerializer
from src.apps.users.models import CustomUser


#models
class PostModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(username='test', password='test')
        self.post = Post.objects.create(author=self.user, text='test')

    def test_post_create(self):
        self.assertEqual(self.post.text, 'test')
        self.assertEqual(self.post.author, self.user)

    def test_post_likes_count(self):
        like = Like.objects.create(user=self.user, post=self.post)
        self.assertEqual(self.post.likes_count(), 1)

    def test_post_comments_count(self):
        comment = Comment.objects.create(author=self.user, post=self.post, text='test')
        self.assertEqual(self.post.comments_count(), 1)


class LikeModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(username='test', password='test')
        self.post = Post.objects.create(author=self.user, text='test')

    def test_like_create(self):
        like = Like.objects.create(user=self.user, post=self.post)
        self.assertEqual(like.user, self.user)
        self.assertEqual(like.post, self.post)
        self.assertTrue(Like.objects.filter(user=self.user, post=self.post).exists())

    def test_unique_like(self):
        Like.objects.create(user=self.user, post=self.post)
        with self.assertRaises(Exception):
            Like.objects.create(user=self.user, post=self.post)


class CommentModelTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(username='test', password='test')
        self.post = Post.objects.create(author=self.user, text='test')

    def test_comment_create(self):
        comment = Comment.objects.create(author=self.user, post=self.post, text='test')
        self.assertEqual(comment.author, self.user)
        self.assertEqual(comment.post, self.post)
        self.assertEqual(comment.text, 'test')
        self.assertTrue(Comment.objects.filter(author=self.user, post=self.post).exists())



#serializers
class LikeSerializerTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(username='test', password='test')
        self.post = Post.objects.create(author=self.user, text='test')

    def test_like_serializer(self):
        like = Like.objects.create(user=self.user, post=self.post)
        serializer = LikeSerializer(like)
        data = serializer.data
        self.assertEqual(data['user'], self.user.id)
        self.assertEqual(data['post'], self.post.id)


class CommentSerializerTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(username='test', password='test')
        self.post = Post.objects.create(author=self.user, text='test')

    def test_comment_serializer(self):
        comment = Comment.objects.create(author=self.user, post=self.post, text='test')
        serializer = CommentSerializer(comment)
        data = serializer.data
        self.assertEqual(data['author'], self.user.id)
        self.assertEqual(data['post'], self.post.id)
        self.assertEqual(data['text'], 'test')


class PostSerializerTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(username='test', password='test')
        self.post = Post.objects.create(author=self.user, text='test')

    def test_post_serializer(self):
        serializer = PostSerializer(self.post)
        data = serializer.data
        self.assertEqual(data['author'], self.user.id)
        self.assertEqual(data['text'], 'test')

    def test_post_serializer_validation_image(self):
        image = SimpleUploadedFile("image.jpg", b"file_content", content_type="image/jpeg")
        post = Post.objects.create(author=self.user, text='test', image=image)
        serializer = PostSerializer(post)
        data = serializer.data
        self.assertEqual(data['image'], post.image.url)

        with self.assertRaises(ValidationError):
            invalid_image = SimpleUploadedFile("file.txt", b"file_content", content_type="text/plain")
            post.image = invalid_image
            serializer = PostSerializer(data=serializer.data)
            serializer.is_valid(raise_exception=True)

    def test_post_serializer_validation_video(self):
        video = SimpleUploadedFile("video.mp4", b"file_content", content_type="video/mp4")
        post = Post.objects.create(author=self.user, text='test', video=video)
        serializer = PostSerializer(post)
        data = serializer.data
        self.assertEqual(data['video'], post.video.url)

        with self.assertRaises(ValidationError):
            invalid_video = SimpleUploadedFile("file.txt", b"file_content", content_type="text/plain")
            post.video = invalid_video
            serializer = PostSerializer(data=serializer.data)
            serializer.is_valid(raise_exception=True)

    def test_post_serializer_validation_audio(self):
        audio = SimpleUploadedFile("audio.mp3", b"file_content", content_type="audio/mpeg")
        post = Post.objects.create(author=self.user, text='test', audio=audio)
        serializer = PostSerializer(post)
        data = serializer.data
        self.assertEqual(data['audio'], post.audio.url)

        with self.assertRaises(ValidationError):
            invalid_audio = SimpleUploadedFile("file.txt", b"file_content", content_type="text/plain")
            post.audio = invalid_audio
            serializer = PostSerializer(data=serializer.data)
            serializer.is_valid(raise_exception=True)