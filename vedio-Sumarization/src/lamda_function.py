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

    # Download original video
    s3.download_file(bucket, key, local_video)

    # Determine mode
    start = event.get("start")
    end = event.get("end")

    if start and end:
        # Manual range
        segments = [(to_seconds(start), to_seconds(end))]
    else:
        # Auto scene detection
        segments = get_shot_segments(bucket, key)

    summaries = []

    for idx, (start, end) in enumerate(segments):
        clip_path = f"/tmp/clip_{idx}.mp4"
        extract_clip(local_video, clip_path, start, end)

        # Read binary for Nova input
        with open(clip_path, "rb") as f:
            clip_bytes = f.read()

        # Call Bedrock Nova
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
        desc = result.get("sceneDescription", f"No description for clip {idx}")
        summaries.append({
            "segment": f"{start}-{end}",
            "description": desc
        })

        # Save to S3 as JSON
        s3.put_object(
            Bucket=OUTPUT_BUCKET,
            Key=f"summaries/{filename}_clip_{idx}.json",
            Body=json.dumps({
                "start": start,
                "end": end,
                "description": desc
            }),
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
    return parts[0]*60 + parts[1]
