import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.api.v1.router import api_router
from app.db.session import engine, SessionLocal
from app.models import Base
from app.models.listing import Listing

# Auto create database tables on startup
Base.metadata.create_all(bind=engine)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Auto seed database if empty (for cloud deployments like Render)
def auto_seed_if_empty():
    db = SessionLocal()
    try:
        count = db.query(Listing).count()
        if count == 0:
            print("[INFO] Empty database detected. Auto-seeding listings...")
            from seed import seed_db
            seed_db()
    except Exception as e:
        print(f"[WARNING] Auto-seed check skipped: {e}")
    finally:
        db.close()

auto_seed_if_empty()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for all deployed environments
app.add_middleware(
    CORSMiddleware,
    allow_origins="https://airbnb-one-peach.vercel.app/
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount local upload storage static route
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "message": "Welcome to Airbnb Clone API (Dark Mode)",
        "docs": "/docs",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
