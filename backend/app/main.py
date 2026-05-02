from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"status": "ok"}

# Main FastAPI app
# endpoints like /crawl, /graph/{scan_id}, /random-walk