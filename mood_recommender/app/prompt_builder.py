def get_template() -> str:
    return (
        "User is feeling {mood}. "
        "Based on the following recommendations: {movies}, "
        "suggest a suitable movie with a mood-matching explanation."
    )

def build_prompt(mood: str, recommendations: list) -> str:
    movie_list = ", ".join(recommendations)
    return get_template().format(mood=mood, movies=movie_list)
