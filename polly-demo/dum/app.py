# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from phi.agent import Agent
# from phi.model.google import Gemini
# from phi.tools.duckduckgo import DuckDuckGo
# from google.generativeai import upload_file, get_file
# import google.generativeai as genai
# from dotenv import load_dotenv
# import os
# import time
# import tempfile
# import requests
# from pathlib import Path
# import hashlib

# load_dotenv()

# app = FastAPI()

# # CORS setup
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # Replace with frontend origin in prod
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Google API config
# API_KEY = os.getenv("GOOGLE_API_KEY")
# if API_KEY:
#     genai.configure(api_key=API_KEY)

# # Agent initialization
# def initialize_agent():
#     return Agent(
#         name="Video AI Summarizer",
#         model=Gemini(id="gemini-2.0-flash-exp"),
#         tools=[DuckDuckGo()],
#         markdown=True,
#     )

# multimodal_Agent = initialize_agent()

# # Video URL
# BIG_BUCK_BUNNY_URL = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"

# # Video cache {video_hash: processed_file}
# processed_video_cache = {}

# def get_video_hash(video_bytes: bytes) -> str:
#     return hashlib.sha256(video_bytes).hexdigest()

# def download_and_process_video():
#     """Downloads and processes video only if not already cached."""
#     try:
#         # Download video
#         response = requests.get(BIG_BUCK_BUNNY_URL)
#         response.raise_for_status()
#         video_bytes = response.content

#         # Compute hash of video
#         video_hash = get_video_hash(video_bytes)

#         if video_hash in processed_video_cache:
#             return processed_video_cache[video_hash]

#         # Save temp file
#         with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
#             temp_video.write(video_bytes)
#             video_path = temp_video.name

#         try:
#             # Upload + poll until processed
#             processed_video = upload_file(video_path)
#             while processed_video.state.name == "PROCESSING":
#                 time.sleep(3)
#                 processed_video = get_file(processed_video.name)

#             # Cache the result
#             processed_video_cache[video_hash] = processed_video
#             return processed_video

#         finally:
#             Path(video_path).unlink(missing_ok=True)

#     except Exception as error:
#         raise HTTPException(status_code=500, detail=f"Error processing video: {str(error)}")

# class ChatRequest(BaseModel):
#     message: str
#     movie_title: str = "Big Buck Bunny"
#     movie_context: str = ""

# @app.post("/api/chat/tree-io")
# async def chat_with_tree_io(request: ChatRequest):
#     try:
#         processed_video = download_and_process_video()

#         analysis_prompt = f"""
#         Analyze the uploaded video for content and context.
        
#         You are Tree.io, an AI assistant specialized in analyzing movies and TV shows.
#         Current movie/show: {request.movie_title}
        
#         User query: {request.message}
#         Give me responses in timestamp of 30 seconds
        
#         Respond to the following query using video insights and supplementary web research.
#         Provide a detailed, user-friendly, and actionable response.
#         If the user asks for summaries, provide every 30 seconds timestamp-based responses when relevant.
#         Keep your response conversational and engaging, as you're chatting in a watch party.
        
#         Do not respond to anything not relevant to the current movie/show or general entertainment topics.
#         """

#         response = multimodal_Agent.run(analysis_prompt, videos=[processed_video])

#         return {
#             "success": True,
#             "response": response.content,
#             "user": "Tree.io",
#             "video_url": BIG_BUCK_BUNNY_URL
#         }

#     except Exception as error:
#         raise HTTPException(status_code=500, detail=f"Error processing request: {str(error)}")


# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="localhost", port=8000)