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
from app.core.copilot_logging import setup_copilot_logging
from app.core.copilot_client import copilot_manager
from app.db.session import engine
from app.core.redis_client import redis_client
from app.core.config import settings
from pathlib import Path

# 定義靜態檔案目錄
STATIC_DIR = Path("/app/static")

# Initialize logging
configure_logging(log_file=settings.LOG_FILE_PATH)
logger = logging.getLogger("app")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("--- 🌌 TraitQuest 啟動中：正在檢測連線 ---")
    
    # Configure logging
    configure_logging(log_file=settings.LOG_FILE_PATH)
    
    # Setup Copilot SDK logging
    setup_copilot_logging()
    
    # Initialize Copilot Client
    logger.info("🤖 初始化 Copilot SDK Client...")
    await copilot_manager.initialize()
    
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
        await redis_client._redis.ping()
        logger.info("✅ [Redis] 連線成功！")
    except Exception as e:
        logger.error(f"❌ [Redis] 連線失敗：{str(e)}")

    yield
    
    # Shutdown
    logger.info("--- 🌑 TraitQuest 已關閉 ---")
    
    # Shutdown Copilot Client
    await copilot_manager.shutdown()
    
    # Shutdown Redis
    await redis_client.disconnect()
    logger.info("✅ Copilot SDK Client 已關閉")

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
    # 如果靜態檔案目錄存在（Docker 環境），優先返回 index.html
    if STATIC_DIR.exists() and (STATIC_DIR / "index.html").exists():
        from fastapi.responses import FileResponse

        return FileResponse(STATIC_DIR / "index.html")

    return {"message": "Welcome to TraitQuest API", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/health")
async def api_health_check():
    """健康檢查端點（Docker 容器使用）"""
    return {"status": "healthy"}


# =============================================================================
# 靜態檔案服務（Docker 生產環境）
# =============================================================================
# 僅當 /app/static 目錄存在時掛載，用於 Docker 容器提供前端 SPA

if STATIC_DIR.exists() and STATIC_DIR.is_dir():
    from fastapi.staticfiles import StaticFiles
    from fastapi.responses import FileResponse
    from starlette.responses import Response
    from starlette.types import Scope

    class CachedStaticFiles(StaticFiles):
        """自定義靜態檔案服務，對特定資源加入長期快取標頭"""

        async def get_response(self, path: str, scope: Scope) -> Response:
            response = await super().get_response(path, scope)
            # /assets 底下的資源通常包含 hash 或為靜態圖片，設定長期快取
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
            return response

    # 掛載 assets 目錄（JS/CSS/圖片等）
    assets_dir = STATIC_DIR / "assets"
    if assets_dir.exists():
        app.mount(
            "/assets", CachedStaticFiles(directory=str(assets_dir)), name="assets"
        )

    # SPA Fallback：所有非 API 路徑返回 index.html
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """SPA 路由 fallback：返回 index.html 讓前端路由處理"""
        file_path = STATIC_DIR / full_path

        # 1. 嘗試返回靜態檔案（如 robots.txt, favicon.ico 等不在 assets 內的檔案）
        if file_path.exists() and file_path.is_file():
            response = FileResponse(file_path)
            if file_path.suffix in [".html", ".json"]:
                response.headers["Cache-Control"] = "no-cache, must-revalidate"
            else:
                response.headers["Cache-Control"] = (
                    "public, max-age=31536000, immutable"
                )
            return response

        # 2. 否則返回 index.html（SPA fallback）
        index_path = STATIC_DIR / "index.html"
        if index_path.exists():
            response = FileResponse(index_path)
            # index.html 絕對不能快取，以確保使用者能拿到最新的 JS/CSS 引用
            response.headers["Cache-Control"] = "no-cache, must-revalidate"
            return response

        # 3. 如果連 index.html 都沒有，返回 API root
        return {"message": "Welcome to TraitQuest API", "status": "active"}

    logger.info("✅ [StaticFiles] 靜態檔案服務已啟用：/app/static")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
