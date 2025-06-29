import subprocess

def extract_clip(input_path, output_path, start_time, end_time):
    duration = end_time - start_time
    command = [
        "ffmpeg",
        "-ss", str(start_time),
        "-i", input_path,
        "-t", str(duration),
        "-c", "copy",
        "-y",
        output_path
    ]
    subprocess.run(command, check=True)
