import asyncio  # Use asyncio for sleeping
import httpx    # Use httpx for async HTTP requests
from .config import settings

# The function is now 'async def'
async def run_code(source_code: str, language_id: int, stdin: str = "") -> dict:
    url = f"{settings.JUDGE0_URL}/submissions"
    headers = {}
    if settings.JUDGE0_KEY:
        headers = {
            "x-rapidapi-key": settings.JUDGE0_KEY,
            "x-rapidapi-host": settings.JUDGE0_HOST_HEADER or "judge0-ce.p.rapidapi.com",
            "content-type": "application/json"
        }
    
    payload = {
        "language_id": language_id, 
        "source_code": source_code, 
        "stdin": stdin
    }

    # Use an async client to make requests
    async with httpx.AsyncClient() as client:
        # 'await' the network call instead of just calling it
        r = await client.post(url, json=payload, headers=headers)
        r.raise_for_status()
        token = r.json().get("token")

        # Poll for result
        for _ in range(60):  # up to ~30s
            # 'await' the polling network call
            rr = await client.get(f"{url}/{token}", headers=headers, params={"base64_encoded":"false"})
            rr.raise_for_status()
            data = rr.json()
            status = data.get("status", {}).get("description")
            if status not in ["In Queue", "Processing"]:
                return data
            # Use 'await asyncio.sleep' instead of 'time.sleep'
            await asyncio.sleep(0.5)

    return {"status":{"description":"Time Limit Exceeded"}, "stderr":None, "stdout":None}