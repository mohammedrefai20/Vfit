from fastapi import FastAPI,Request
from app.core.config import settings
from fastapi.responses import JSONResponse
from app.core.logging import configure_logging
from app.api.v1.router import api_router

configure_logging(settings.debug)

app = FastAPI(title=settings.app_name)
app.include_router(api_router)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"error": "internal_server_error", "detail": str(exc) if settings.debug else None},
    )