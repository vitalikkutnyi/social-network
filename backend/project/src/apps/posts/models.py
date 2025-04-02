from django.db import models
from src.apps.users.models import CustomUser
from django.utils import timezone


class Post(models.Model):
    objects = None
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="posts")
    text = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to="post_images/", blank=True, null=True)
    video = models.FileField(upload_to="post_videos/", blank=True, null=True)
    audio = models.FileField(upload_to="post_audio/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_pinned = models.BooleanField(default=False)
    is_repost = models.BooleanField(default=False)
    original_author = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name="reposted_posts")

    def likes_count(self):
        return self.likes.count()

    def comments_count(self):
        return self.comments.count()
    
    def reposts_count(self):
        return Post.objects.filter(
            is_repost=True,
            text=self.text,
            image=self.image,
            video=self.video,
            audio=self.audio,
            original_author=self.author
        ).count()

    def __str__(self):
        return f"Post by {self.author} at {self.created_at}"


class Like(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="likes")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['user', 'post'], name='unique_like')
        ]

    def __str__(self):
        return f"{self.user} liked {self.post}"


class Comment(models.Model):
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name="comments")
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author} on {self.post}"
    

def default_expires_at():
    return timezone.now() + timezone.timedelta(hours=24)

class Story(models.Model):
    author = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="stories")
    image = models.ImageField(upload_to="story_images/", blank=True, null=True)
    video = models.FileField(upload_to="story_videos/", blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(default=default_expires_at)

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"Story by {self.author} at {self.created_at}"
    

class ViewedStory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="viewed_stories")
    story = models.ForeignKey(Story, on_delete=models.CASCADE, related_name="viewers")
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "story")

    def __str__(self):
        return f"{self.user.username} viewed {self.story.id}"