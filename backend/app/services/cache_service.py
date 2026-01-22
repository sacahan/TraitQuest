"""
Redis 快取服務

提供 user_profile, analytics_result 等資料的快取功能
"""

import json
import logging
from datetime import timedelta
from typing import Optional

from app.core.redis_client import redis_client

logger = logging.getLogger("app")

# TTL 設定
USER_PROFILE_TTL = timedelta(hours=1)
ANALYTICS_RESULT_TTL = timedelta(minutes=5)


class CacheService:
    """快取服務類"""

    @staticmethod
    async def get_user_profile(user_id: str) -> Optional[dict]:
        """
        獲取用戶快取資料

        Args:
            user_id: 用戶 ID

        Returns:
            快取的用戶資料字典，若不存在則返回 None
        """
        key = f"user_profile:{user_id}"
        try:
            data = await redis_client.get(key)
            if data:
                logger.info(f"💾 [Redis Cache Hit] user_profile for {user_id[:8]}...")
                return json.loads(data)
            return None
        except Exception as e:
            logger.warning(f"Redis get user_profile failed: {e}")
            return None

    @staticmethod
    async def set_user_profile(user_id: str, profile: dict):
        """
        快取用戶資料

        Args:
            user_id: 用戶 ID
            profile: 用戶資料字典
        """
        key = f"user_profile:{user_id}"
        try:
            await redis_client.set(
                key,
                json.dumps(profile, default=str),
                ex=int(USER_PROFILE_TTL.total_seconds()),
            )
            logger.debug(f"💾 [Redis Cache Set] user_profile for {user_id[:8]}...")
        except Exception as e:
            logger.warning(f"Redis set user_profile failed: {e}")

    @staticmethod
    async def invalidate_user_profile(user_id: str):
        """
        清除用戶快取

        Args:
            user_id: 用戶 ID
        """
        key = f"user_profile:{user_id}"
        try:
            await redis_client.delete(key)
            logger.debug(
                f"💾 [Redis Cache Invalidate] user_profile for {user_id[:8]}..."
            )
        except Exception as e:
            logger.warning(f"Redis delete user_profile failed: {e}")

    @staticmethod
    async def get_analytics_result(session_id: str) -> Optional[dict]:
        """
        獲取分析結果快取

        Args:
            session_id: WebSocket Session ID

        Returns:
            快取的分析結果字典，若不存在則返回 None
        """
        key = f"analytics_result:{session_id}"
        try:
            data = await redis_client.get(key)
            if data:
                logger.debug(
                    f"💾 [Redis Cache Hit] analytics_result for {session_id[:8]}..."
                )
                return json.loads(data)
            return None
        except Exception as e:
            logger.warning(f"Redis get analytics_result failed: {e}")
            return None

    @staticmethod
    async def set_analytics_result(session_id: str, result: dict):
        """
        快取分析結果 (TTL 5 分鐘)

        Args:
            session_id: WebSocket Session ID
            result: 分析結果字典
        """
        key = f"analytics_result:{session_id}"
        try:
            await redis_client.set(
                key,
                json.dumps(result, default=str),
                ex=int(ANALYTICS_RESULT_TTL.total_seconds()),
            )
            logger.debug(
                f"💾 [Redis Cache Set] analytics_result for {session_id[:8]}..."
            )
        except Exception as e:
            logger.warning(f"Redis set analytics_result failed: {e}")

    @staticmethod
    async def invalidate_analytics_result(session_id: str):
        """
        清除分析結果快取

        Args:
            session_id: WebSocket Session ID
        """
        key = f"analytics_result:{session_id}"
        try:
            await redis_client.delete(key)
            logger.debug(
                f"💾 [Redis Cache Invalidate] analytics_result for {session_id[:8]}..."
            )
        except Exception as e:
            logger.warning(f"Redis delete analytics_result failed: {e}")
