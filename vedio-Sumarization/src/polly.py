import boto3

def convert_text_to_audio(text: str, output_file: str = "summary.mp3"):
    polly = boto3.client("polly")
    response = polly.synthesize_speech(
        OutputFormat="mp3",
        Text=text,
        VoiceId="Joanna"
    )

    with open(output_file, "wb") as file:
        file.write(response["AudioStream"].read())
