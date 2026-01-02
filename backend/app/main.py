import logging
import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api import auth, quest, quest_ws, map
from app.core.logging_config import configure_logging
from app.db.session import engine
from app.core.redis_client import redis_client
from app.core.config import settings

# Initialize logging
configure_logging(log_file=settings.LOG_FILE_PATH)
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

@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Filter out map polling logs to avoid spamming
    if request.url.path == "/v1/map/regions":
        return await call_next(request)

    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000  # milliseconds
    
    logger.info(
        f"➡️  {request.method} {request.url.path} "
        f"- {response.status_code} ({process_time:.2f}ms)"
    )
    
    return response

@app.get("/")
async def root():
    return {"message": "Welcome to TraitQuest API", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
