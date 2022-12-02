from django.urls import path
from . import views
from .views import MyTokenObtainPairView

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path('', views.getRoutes, name='get_routes'),
    path('register/', views.RegisterView, name='user_register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('isloggedIn/', views.example_authenticated_view, name='is_logged_in'),
    path('logout/', views.logout_view, name='token_logout'),
    path('categories/', views.category_get, name='get_categories'),
    path('categories/create', views.category_create, name='post_categories'),
    path('categories/<str:pk>', views.category_retrieve_update_delete, name='get_put_delete_category'),
    path('kpis/', views.kpi_get, name='get_kpis'),
    path('kpis/search', views.kpi_search, name='get_kpis_search'),
    path('kpis/create', views.kpi_create, name='post_kpis'),
    path('kpis/<str:pk>', views.kpi_retrieve_update_delete, name='get_put_delete_kpi'),
]