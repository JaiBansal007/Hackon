import boto3

def start_transcription_job(job_name, media_uri, output_bucket):
    transcribe = boto3.client("transcribe")
    response = transcribe.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={"MediaFileUri": media_uri},
        MediaFormat="mp4",
        LanguageCode="en-US",
        OutputBucketName=output_bucket
    )
    return response
