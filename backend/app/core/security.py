from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings

def verify_google_token(token: str) -> Optional[dict]:
    try:
        # Verify the ID token using Google's public keys
        id_info = id_token.verify_oauth2_token(
            token, requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        return id_info
    except Exception as e:
        print(f"Error verifying Google token: {e}")
        return None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt
