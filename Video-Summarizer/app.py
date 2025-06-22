from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from phi.agent import Agent
from phi.model.google import Gemini
from phi.tools.duckduckgo import DuckDuckGo
from google.generativeai import upload_file, get_file
import google.generativeai as genai
from dotenv import load_dotenv
import os
import time
import tempfile
import requests
from pathlib import Path

load_dotenv()

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Google API
API_KEY = os.getenv("GOOGLE_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

# Initialize the agent
def initialize_agent():
    return Agent(
        name="Video AI Summarizer",
        model=Gemini(id="gemini-2.0-flash-exp"),
        tools=[DuckDuckGo()],
        markdown=True,
    )

## Initialize the agent
multimodal_Agent = initialize_agent()

# Big Buck Bunny video URL
BIG_BUCK_BUNNY_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"

# Global variable to store processed video
processed_video_cache = None

def download_and_process_video():
    """Download Big Buck Bunny video and process it for AI analysis"""
    global processed_video_cache
    
    if processed_video_cache is not None:
        return processed_video_cache
    
    try:
        # Download the video
        response = requests.get(BIG_BUCK_BUNNY_URL)
        response.raise_for_status()
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_video:
            temp_video.write(response.content)
            video_path = temp_video.name
        
        try:
            # Upload and process video file
            processed_video = upload_file(video_path)
            while processed_video.state.name == "PROCESSING":
                time.sleep(3)
                processed_video = get_file(processed_video.name)
            
            processed_video_cache = processed_video
            return processed_video
            
        finally:
            # Clean up temporary file
            Path(video_path).unlink(missing_ok=True)
            
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Error processing video: {str(error)}")

class ChatRequest(BaseModel):
    message: str
    movie_title: str = "Big Buck Bunny"
    movie_context: str = ""

@app.post("/api/chat/tree-io")
async def chat_with_tree_io(request: ChatRequest):
    try:
        # Get or process the video
        processed_video = download_and_process_video()
        
        # Create analysis prompt similar to the Streamlit version
        analysis_prompt = f"""
        Analyze the uploaded video for content and context.
        
        You are Tree.io, an AI assistant specialized in analyzing movies and TV shows.
        Current movie/show: {request.movie_title}
        
        User query: {request.message}
        Give me responses in timestamp of 30 seconds
        
        Respond to the following query using video insights and supplementary web research.
        Provide a detailed, user-friendly, and actionable response.
        If the user asks for summaries, provide every 30 seconds timestamp-based responses when relevant.
        Keep your response conversational and engaging, as you're chatting in a watch party.
        
        Do not respond to anything not relevant to the current movie/show or general entertainment topics.
        """
        
        # AI agent processing with video
        response = multimodal_Agent.run(analysis_prompt, videos=[processed_video])
        
        return {
            "success": True,
            "response": response.content,
            "user": "Tree.io",
            "video_url": BIG_BUCK_BUNNY_URL
        }
        
    except Exception as error:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(error)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)