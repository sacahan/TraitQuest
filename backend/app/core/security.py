from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from google.oauth2 import id_token
from google.auth.transport import requests
from app.core.config import settings

import httpx

async def verify_google_token(token: str) -> Optional[dict]:
    # 嘗試作為 ID Token 驗證
    try:
        id_info = id_token.verify_oauth2_token(
            token, requests.Request(), settings.GOOGLE_CLIENT_ID
        )
        return id_info
    except Exception:
        # 如果 ID Token 驗證失敗，嘗試作為 Access Token 調用 userinfo API
        try:
            async with httpx.AsyncClient() as client:
                resp = await client.get(
                    f"https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {token}"}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    return {
                        "sub": data.get("sub"),
                        "email": data.get("email"),
                        "name": data.get("name"),
                        "picture": data.get("picture"),
                        "email_verified": data.get("email_verified")
                    }
        except Exception as e:
            print(f"Error verifying Google access token: {e}")
    
    return None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return payload
    except Exception as e:
        print(f"Error decoding JWT token: {e}")
        return None
