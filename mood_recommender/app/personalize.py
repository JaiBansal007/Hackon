import boto3
from app.config import CAMPAIGN_ARN

personalize_runtime = boto3.client("personalize-runtime")

def get_recommendations(user_id: str) -> list:
    response = personalize_runtime.get_recommendations(
        campaignArn=CAMPAIGN_ARN,
        userId=user_id
    )
    return [item['itemId'] for item in response.get('itemList', [])]
