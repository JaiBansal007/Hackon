# main.py
from personalize.get_recommendations import get_recommendations
from llm.build_prompt import build_prompt
from llm.call_bedrock import get_llm_output
from search.ott_search import search_ott_platforms

# Sample inputs
user_id = "user123"
user_mood = "excited"
campaign_arn = "arn:aws:personalize:xyz:campaign/moodrec"

# Step 1: Get movie recs
recommendations = get_recommendations(user_id, campaign_arn)

# Step 2: Build LLM prompt
prompt = build_prompt(user_mood, recommendations)

# Step 3: Call LLM (Amazon Bedrock)
personalized_output = get_llm_output(prompt)

# Step 4: Search platform
for movie in recommendations:
    platform = search_ott_platforms(movie)
    print(f"{movie} → {platform}")

print("\nFinal LLM Output:\n", personalized_output)
