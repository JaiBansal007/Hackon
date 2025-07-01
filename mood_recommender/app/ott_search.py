# Simulate an OTT DB lookup
def search_ott(movie_name: str) -> str:
    mock_db = {
        "Inception": "Amazon Prime",
        "Interstellar": "Netflix",
        "Avatar": "Disney+"
    }
    return mock_db.get(movie_name, "Unknown Platform")
