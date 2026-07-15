"""Entry point: seeds database then starts the FastAPI server."""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from app.db.seed import run_seed

if __name__ == "__main__":
    print("Running database seed...")
    run_seed()
    print("Starting server...")
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
