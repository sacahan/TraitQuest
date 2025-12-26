import redis.asyncio as redis
from app.core.config import settings
from typing import Optional

class RedisClient:
    def __init__(self):
        self._redis: Optional[redis.Redis] = None

    async def connect(self):
        if not self._redis:
            self._redis = await redis.from_url(
                f"redis://{settings.REDIS_HOST}:{settings.REDIS_PORT}",
                db=settings.REDIS_DB,
                password=settings.REDIS_PASSWORD,
                decode_responses=True
            )
        return self._redis

    async def disconnect(self):
        if self._redis:
            await self._redis.close()
            self._redis = None

    async def get_session(self, session_id: str):
        if not self._redis: await self.connect()
        return await self._redis.get(f"session:{session_id}")

    async def set_session(self, session_id: str, data: str, ex: int = 1800):
        if not self._redis: await self.connect()
        await self._redis.set(f"session:{session_id}", data, ex=ex)

redis_client = RedisClient()
