import boto3
from app.config import CACHE_TABLE

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(CACHE_TABLE)

def get_from_cache(video_id: str) -> str | None:
    response = table.get_item(Key={"video_id": video_id})
    return response.get("Item", {}).get("summary")

def write_to_cache(video_id: str, summary: str):
    table.put_item(Item={"video_id": video_id, "summary": summary})
