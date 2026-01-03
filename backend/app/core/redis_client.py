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

    async def get_display_name(self, user_id: str) -> Optional[str]:
        """從 Redis 快取取得使用者的 display_name"""
        if not self._redis: await self.connect()
        return await self._redis.get(f"user:display_name:{user_id}")

    async def set_display_name(self, user_id: str, display_name: str, ex: int = 1800):
        """將使用者的 display_name 存入 Redis 快取（預設 TTL: 30 分鐘）"""
        if not self._redis: await self.connect()
        await self._redis.set(f"user:display_name:{user_id}", display_name, ex=ex)

    async def invalidate_display_name(self, user_id: str):
        """清除指定使用者的 display_name 快取"""
        if not self._redis: await self.connect()
        await self._redis.delete(f"user:display_name:{user_id}")

redis_client = RedisClient()
