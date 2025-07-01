import time
import boto3

rek = boto3.client("rekognition")

def get_shot_segments(bucket, key):
    start_resp = rek.start_segment_detection(
        Video={'S3Object': {'Bucket': bucket, 'Name': key}},
        SegmentTypes=["SHOT"]
    )
    job_id = start_resp["JobId"]

    # Wait for result
    while True:
        res = rek.get_segment_detection(JobId=job_id)
        if res["JobStatus"] == "SUCCEEDED":
            break
        elif res["JobStatus"] == "FAILED":
            raise Exception("Rekognition segment detection failed")
        time.sleep(5)

    segments = []
    for seg in res["Segments"]:
        s = seg["StartTimestampMillis"] / 1000.0
        e = seg["EndTimestampMillis"] / 1000.0
        if (e - s) > 2:
            segments.append((s, e))
    return segments
