from rest_framework import serializers
from .models import Plot, RoomRequirement


class PlotSerializer(serializers.ModelSerializer):

    class Meta:
        model = Plot
        fields = '__all__'
        read_only_fields = ['user']


class RoomRequirementSerializer(serializers.ModelSerializer):

    class Meta:
        model = RoomRequirement
        fields = '__all__'
        
