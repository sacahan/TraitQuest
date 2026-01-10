import logging
import time
import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError, ResponseValidationError
from pydantic import ValidationError
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

@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Filter out map polling logs to avoid spamming
    if request.url.path == "/v1/map/regions":
        return await call_next(request)

    start_time = time.time()

    # Log incoming request details
    logger.info(f"➡️  {request.method} {request.url.path} - START")

    try:
        response = await call_next(request)
        process_time = (time.time() - start_time) * 1000  # milliseconds

        # Log based on status code
        if response.status_code >= 500:
            logger.error(
                f"❌ {request.method} {request.url.path} "
                f"- {response.status_code} ({process_time:.2f}ms)"
            )
        elif response.status_code >= 400:
            logger.warning(
                f"⚠️  {request.method} {request.url.path} "
                f"- {response.status_code} ({process_time:.2f}ms)"
            )
        else:
            logger.info(
                f"✅ {request.method} {request.url.path} "
                f"- {response.status_code} ({process_time:.2f}ms)"
            )

        return response
    except Exception as e:
        process_time = (time.time() - start_time) * 1000
        logger.error(
            f"💥 {request.method} {request.url.path} "
            f"- EXCEPTION: {type(e).__name__}: {str(e)} ({process_time:.2f}ms)"
        )
        logger.error(f"Stack Trace:\n{traceback.format_exc()}")
        raise


# Pydantic Request Validation Error Handler
@app.exception_handler(RequestValidationError)
async def request_validation_exception_handler(
    request: Request, exc: RequestValidationError
):
    logger.error(f"❌ Request Validation Error on {request.method} {request.url.path}")
    logger.error(f"Validation Details: {exc.errors()}")
    logger.error(f"Request Body: {exc.body}")
    return JSONResponse(
        status_code=422, content={"detail": exc.errors(), "body": exc.body}
    )


# Pydantic Response Validation Error Handler (最關鍵！)
@app.exception_handler(ResponseValidationError)
async def response_validation_exception_handler(
    request: Request, exc: ResponseValidationError
):
    logger.error(f"🔥 Response Validation Error on {request.method} {request.url.path}")
    logger.error(
        "This means the API returned data that doesn't match the response model!"
    )
    logger.error(f"Validation Errors: {exc.errors()}")
    logger.error(f"Stack Trace:\n{traceback.format_exc()}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error: Response validation failed",
            "validation_errors": exc.errors(),
        },
    )


# Generic Pydantic ValidationError Handler
@app.exception_handler(ValidationError)
async def pydantic_validation_exception_handler(request: Request, exc: ValidationError):
    logger.error(f"❌ Pydantic Validation Error on {request.method} {request.url.path}")
    logger.error(f"Validation Details: {exc.errors()}")
    logger.error(f"Stack Trace:\n{traceback.format_exc()}")
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


# Global exception handler (catch-all)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"💥 Unhandled Exception on {request.method} {request.url.path}")
    logger.error(f"Exception Type: {type(exc).__name__}")
    logger.error(f"Exception Message: {str(exc)}")
    logger.error(f"Stack Trace:\n{traceback.format_exc()}")
    return JSONResponse(
        status_code=500, content={"detail": "Internal server error", "error": str(exc)}
    )


# CORS 中間件 - 允許前端跨域請求
# 注意：當 allow_credentials=True 時，allow_origins 不能使用 "*"
# [FIX] CORS 必須「最後」添加，使其成為最外層的中間件，確保所有回應（包含錯誤）都帶有 CORS headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,  # 從環境變數讀取，開發環境預設 http://localhost:3000
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
