import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api import auth, quest, quest_ws, map
from app.core.logging_config import configure_logging
from app.db.session import engine
from app.core.redis_client import redis_client

# Initialize logging
configure_logging()
logger = logging.getLogger("app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Test connections
    logger.info("--- 🌌 TraitQuest 啟動中：正在檢測連線 ---")
    
    # Test PostgreSQL
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("✅ [PostgreSQL] 連線成功！")
    except Exception as e:
        logger.error(f"❌ [PostgreSQL] 連線失敗：{str(e)}")

    # Test Redis
    try:
        await redis_client.connect()
        # aioredis v2 ping()
        await redis_client._redis.ping()
        logger.info("✅ [Redis] 連線成功！")
    except Exception as e:
        logger.error(f"❌ [Redis] 連線失敗：{str(e)}")

    yield
    
    # Shutdown
    await redis_client.disconnect()
    logger.info("--- 🌑 TraitQuest 已關閉 ---")

app = FastAPI(title="TraitQuest API", version="1.0.0", lifespan=lifespan)

app.include_router(auth.router, prefix="/v1")
app.include_router(quest.router, prefix="/v1")
app.include_router(quest_ws.router, prefix="/v1")
app.include_router(map.router, prefix="/v1")

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to TraitQuest API", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
