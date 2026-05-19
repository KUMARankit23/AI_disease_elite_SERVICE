from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router, registry


@asynccontextmanager
async def lifespan(app: FastAPI):
    registry.load_all()
    yield


app = FastAPI(
    title="Elite Disease AI",
    description="Hybrid Explainable ML + LLM Disease Prediction System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
