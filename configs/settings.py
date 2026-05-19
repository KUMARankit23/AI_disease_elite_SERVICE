import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
MODEL_DIR = "saved_models/"
OPENAI_MODEL = "gpt-4o-mini"
TOP_K_RAG = 3
