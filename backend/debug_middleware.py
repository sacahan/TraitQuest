from app.main import app
from app.core.config import settings

print(f"DEBUG: CORS_ORIGINS = {settings.CORS_ORIGINS}")
print(f"DEBUG: Type of CORS_ORIGINS = {type(settings.CORS_ORIGINS)}")

print("DEBUG: Middleware Stack:")
for i, m in enumerate(app.user_middleware):
    print(f"  {i}: {m.cls.__name__ if hasattr(m, 'cls') else m}")
