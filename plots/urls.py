from django.urls import path

from .views import (
    PlotListCreateView,
    RoomRequirementListCreateView
)
from .views import (
    PlotListCreateView,
    RoomRequirementListCreateView,
    GenerateLayoutView
)

urlpatterns = [
    path(
        'plots/',
        PlotListCreateView.as_view(),
        name='plot-list-create'
    ),

    path(
        'requirements/',
        RoomRequirementListCreateView.as_view(),
        name='requirement-list-create'
    ),
    path(
    'plots/<int:plot_id>/generate-layout/',
    GenerateLayoutView.as_view(),
    name='generate-layout'
),
]