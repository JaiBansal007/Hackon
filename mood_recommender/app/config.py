import os
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION")
BEDROCK_MODEL_ID = os.getenv("BEDROCK_MODEL_ID")
CAMPAIGN_ARN = os.getenv("PERSONALIZE_CAMPAIGN_ARN")
