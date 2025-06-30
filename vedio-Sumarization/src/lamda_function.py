import os, json, time, urllib.parse
import boto3
from rekognition_utils import get_shot_segments
from ffmpeg_utils import extract_clip

s3 = boto3.client("s3")
bedrock = boto3.client("bedrock-runtime")

OUTPUT_BUCKET = os.environ["OUTPUT_BUCKET"]
MODEL_ID = os.environ["NOVA_MODEL_ID"]

def lambda_handler(event, context):
    record = event["Records"][0]["s3"]
    bucket = record["bucket"]["name"]
    key = urllib.parse.unquote_plus(record["object"]["key"])
    filename = key.split("/")[-1]
    local_video = f"/tmp/{filename}"

    s3.download_file(bucket, key, local_video)

    start = event.get("start")
    end = event.get("end")

    # Determine segments
    if start and end:
        full_start = to_seconds(start)
        full_end = to_seconds(end)
        segments = split_into_minute_chunks(full_start, full_end)
    else:
        segments = get_shot_segments(bucket, key)

    summaries = []

    for idx, (start_sec, end_sec) in enumerate(segments):
        s3_key = f"summaries/{filename}_clip_{start_sec}_{end_sec}.json"

        # Check if summary exists in S3
        try:
            response = s3.get_object(Bucket=OUTPUT_BUCKET, Key=s3_key)
            existing_summary = json.loads(response["Body"].read())
            summaries.append(existing_summary)
            continue  # skip to next chunk
        except s3.exceptions.NoSuchKey:
            pass  # continue to process

        # Extract the clip
        clip_path = f"/tmp/clip_{start_sec}_{end_sec}.mp4"
        extract_clip(local_video, clip_path, start_sec, end_sec)

        with open(clip_path, "rb") as f:
            clip_bytes = f.read()

        body = {
            "inputMedia": {
                "media": {
                    "bytes": clip_bytes,
                    "mediaType": "video/mp4"
                }
            }
        }

        response = bedrock.invoke_model(
            modelId=MODEL_ID,
            contentType="application/json",
            accept="application/json",
            body=json.dumps(body)
        )

        result = json.loads(response["body"].read())
        desc = result.get("sceneDescription", f"No description for {start_sec}-{end_sec}")
        summary = {
            "start": start_sec,
            "end": end_sec,
            "description": desc
        }

        summaries.append(summary)

        # Save to S3
        s3.put_object(
            Bucket=OUTPUT_BUCKET,
            Key=s3_key,
            Body=json.dumps(summary),
            ContentType="application/json"
        )

    return {
        "statusCode": 200,
        "body": json.dumps({
            "message": "Summarization complete",
            "segments": summaries
        })
    }

def to_seconds(time_str):
    parts = list(map(int, time_str.split(":")))
    return parts[0] * 60 + parts[1]

def split_into_minute_chunks(start_sec, end_sec):
    chunks = []
    current = start_sec
    while current < end_sec:
        next_min = min(current + 60, end_sec)
        chunks.append((current, next_min))
        current = next_min
    return chunks
