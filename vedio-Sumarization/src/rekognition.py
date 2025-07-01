import boto3

def detect_scenes(bucket: str, video_name: str):
    rekognition = boto3.client("rekognition")
    response = rekognition.start_label_detection(
        Video={"S3Object": {"Bucket": bucket, "Name": video_name}},
        MinConfidence=70
    )
    return response['JobId']
