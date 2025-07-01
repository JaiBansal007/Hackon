from app.personalize import get_recommendations
from app.prompt_builder import build_prompt
from app.bedrock_client import call_bedrock
from app.ott_search import search_ott

def main(user_id: str, user_mood: str):
    print(f"Fetching mood-based recommendations for User: {user_id} Mood: {user_mood}")

    # Step 1: Get personalized movie recommendations
    recs = get_recommendations(user_id)
    print("Personalized Recommendations:", recs)

    # Step 2: Build model prompt
    prompt = build_prompt(user_mood, recs)
    print("\nGenerated Prompt:\n", prompt)

    # Step 3: Call Amazon Bedrock (Nova Pro model)
    response = call_bedrock(prompt)
    print("\nLLM Output:\n", response)

    # Step 4: Search each recommendation
    print("\nOTT Platform Matches:")
    for movie in recs:
        print(f"{movie}: {search_ott(movie)}")

if __name__ == "__main__":
    # Simulate frontend input
    main(user_id="user123", user_mood="excited")
