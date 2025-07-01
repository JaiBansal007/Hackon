import boto3
import json
from app.config import AWS_REGION, BEDROCK_MODEL_ID

def call_bedrock(prompt: str) -> str:
    client = boto3.client("bedrock-runtime", region_name=AWS_REGION)
    
    body = {
        "inputText": prompt,
        "textGenerationConfig": {
            "maxTokenCount": 400,
            "temperature": 0.7,
            "topP": 0.9
        }
    }

    response = client.invoke_model(
        modelId=BEDROCK_MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=json.dumps(body)
    )

    raw = json.loads(response["body"].read())
    return raw.get("results", [{}])[0].get("outputText", "No result.")
