from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.core.database import init_db
from app.core.exceptions import register_exception_handlers
from app.api.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Triggers Base.metadata.create_all on startup
    await init_db()
    yield

app = FastAPI(
    title="CodePilot AI",
    description="An AI code reviewer that remembers your team's coding style and intelligently minimizes AI costs.",
    version="1.0.0",
    lifespan=lifespan
)

# Clean and compile CORS origins list to prevent quote/bracket string parsing issues
origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
if isinstance(settings.CORS_ORIGINS, list):
    for o in settings.CORS_ORIGINS:
        clean_o = str(o).strip("[]\"' ")
        if clean_o and clean_o not in origins:
            origins.append(clean_o)
elif isinstance(settings.CORS_ORIGINS, str):
    clean_o = settings.CORS_ORIGINS.strip("[]\"' ")
    if clean_o and clean_o not in origins:
        origins.append(clean_o)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register custom exception responders
register_exception_handlers(app)

# Mount compiled API routers
app.include_router(api_router, prefix="/api")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "codepilot-ai-backend",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
