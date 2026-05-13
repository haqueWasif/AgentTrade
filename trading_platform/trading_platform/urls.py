from django.contrib import admin
from django.urls import path, include

from core.views import RegisterView

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth
    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # Apps
    path("api/core/", include("core.urls")),
    path("api/agents/", include("agents.urls")),
    path("api/journal/", include("journal.urls")),
    path("api/subscriptions/", include("subscriptions.urls")),
    path("api/market/", include("market_data.urls")),
]