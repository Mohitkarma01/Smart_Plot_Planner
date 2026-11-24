from django.db import models
from django.contrib.auth.models import User


class Plot(models.Model):

    ROAD_CHOICES = [
        ('North', 'North'),
        ('South', 'South'),
        ('East', 'East'),
        ('West', 'West'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    length = models.FloatField()
    width = models.FloatField()

    road_side = models.CharField(
        max_length=10,
        choices=ROAD_CHOICES
    )

    floors = models.PositiveIntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.length} x {self.width} - {self.road_side}"


class RoomRequirement(models.Model):

    plot = models.OneToOneField(
        Plot,
        on_delete=models.CASCADE
    )

    bedrooms = models.PositiveIntegerField(default=1)
    bathrooms = models.PositiveIntegerField(default=1)
    kitchens = models.PositiveIntegerField(default=1)
    halls = models.PositiveIntegerField(default=1)

    parking = models.BooleanField(default=False)
    garden = models.BooleanField(default=False)

    def __str__(self):
        return f"Requirements for {self.plot}"
    