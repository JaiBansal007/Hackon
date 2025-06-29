const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.MOOD_API_KEY);

// Import movie list
const { movieNames } = require('../data.js');

/**
 * Validate if the user input is related to movies, moods, or emotions
 * @param {string} userInput - The user's input text
 * @returns {Promise<boolean>} - Whether the input is valid for movie recommendations
 */
async function validateMoodInput(userInput) {
    console.log('Validating mood input:', userInput);
    
    // Quick pre-validation for obviously invalid inputs
    if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
        console.log('Validation failed: empty or invalid input');
        return false;
    }
    
    // Check for random/gibberish text (consecutive consonants or vowels, no spaces, etc.)
    const cleanInput = userInput.toLowerCase().trim();
    
    // If input is too short and doesn't contain common mood words, likely invalid
    if (cleanInput.length < 3) {
        console.log('Validation failed: input too short');
        return false;
    }
    
    // Check for patterns that suggest gibberish
    const hasConsecutiveConsonants = /[bcdfghjklmnpqrstvwxyz]{5,}/i.test(cleanInput);
    const hasConsecutiveVowels = /[aeiou]{4,}/i.test(cleanInput);
    const hasNoSpacesButLong = cleanInput.length > 15 && !cleanInput.includes(' ');
    
    if (hasConsecutiveConsonants || hasConsecutiveVowels || hasNoSpacesButLong) {
        console.log('Validation failed: gibberish pattern detected');
        return false;
    }
    
    // Common mood/emotion/movie-related keywords
    const moodKeywords = [
        'happy', 'sad', 'excited', 'tired', 'angry', 'calm', 'stressed', 'relaxed',
        'bored', 'energetic', 'depressed', 'anxious', 'cheerful', 'moody', 'romantic',
        'scary', 'horror', 'funny', 'comedy', 'action', 'adventure', 'drama', 'thriller',
        'feel', 'feeling', 'mood', 'emotion', 'want', 'need', 'like', 'love', 'hate',
        'suggest', 'recommend', 'show', 'watch', 'movie', 'film', 'something', 'anything',
        'good', 'bad', 'great', 'awesome', 'terrible', 'amazing', 'boring', 'fun',
        'chill', 'relax', 'party', 'date', 'night', 'weekend', 'today', 'tonight'
    ];
    
    // Check if input contains any mood-related keywords
    const containsMoodKeywords = moodKeywords.some(keyword => 
        cleanInput.includes(keyword)
    );
    
    if (containsMoodKeywords) {
        console.log('Validation passed: mood keywords found');
        return true;
    }
    
    // For testing purposes, let's be more lenient and allow the AI to validate
    // Use AI to validate more complex inputs
    try {
        console.log('Using AI validation for:', cleanInput);
        
        const validationPrompt = `
        Analyze this user input: "${userInput}"
        
        Determine if this input is related to:
        1. Emotions or feelings (happy, sad, excited, etc.)
        2. Movie preferences or requests (horror, comedy, action, etc.)
        3. General mood descriptions or states
        4. Requests for entertainment recommendations
        
        If the input is clearly unrelated to movies, emotions, or entertainment (like random text, questions about unrelated topics, gibberish), respond with "INVALID".
        If the input could reasonably be interpreted as mood/movie related, respond with "VALID".
        
        Examples:
        - "I'm feeling sad" → VALID
        - "suggest something horror" → VALID
        - "who is prime minister of india" → INVALID
        - "kjdnfevkjnefnervkn" → INVALID
        - "I want something funny" → VALID
        - "bored" → VALID
        
        Respond with only "VALID" or "INVALID".
        `;
        
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(validationPrompt);
        const response = await result.response;
        const validationResult = response.text().trim().toUpperCase();
        
        console.log('AI validation result:', validationResult);
        return validationResult === 'VALID';
    } catch (error) {
        console.error('Validation error:', error);
        // If validation fails, be permissive for legitimate-looking inputs
        // Only reject obviously invalid inputs
        const isObviouslyInvalid = 
            cleanInput.length > 20 && !cleanInput.includes(' ') || // Long string without spaces
            /^[a-z]{10,}$/i.test(cleanInput) || // Single long "word"
            cleanInput.includes('prime minister') ||
            cleanInput.includes('president') ||
            cleanInput.includes('capital') ||
            cleanInput.includes('mathematics') ||
            cleanInput.includes('formula');
            
        console.log('Fallback validation:', !isObviouslyInvalid);
        return !isObviouslyInvalid;
    }
}

/**
 * Get mood-based movie recommendations using Amazon
 * @param {string} userMood - The user's mood/feeling text
 * @param {Array} viewingHistory - User's viewing history for fallback recommendations
 * @returns {Promise<Array>} - Array of recommended movie names
 */
async function getMoodBasedRecommendations(userMood, viewingHistory = []) {
    try {
        // First, validate if the input is movie/mood related
        const isValidMoodInput = await validateMoodInput(userMood);
        if (!isValidMoodInput) {
            console.log('Invalid mood input detected:', userMood);
            
            // Get current time of day for fallback recommendations
            const now = new Date();
            const timeOfDay = getTimeOfDay(now);
            const fallbackRecs = getFallbackRecommendations(viewingHistory, timeOfDay);
            
            return {
                success: true,
                error: "Please provide a mood, feeling, or movie preference for recommendations.",
                recommendations: fallbackRecs,
                isInvalidInput: true,
                userMood,
                timeOfDay,
                message: viewingHistory.length > 0 
                    ? "Showing recommendations based on your viewing history and current time."
                    : `Showing recommendations based on current time (${timeOfDay}).`
            };
        }

        // Get current time of day
        const now = new Date();
        const timeOfDay = getTimeOfDay(now);
        const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
        
        const prompt = `
        You are a movie recommendation AI assistant. Based on the user's mood and the current time context, recommend 5-6 movies from the provided list.

        Context:
        - Current time: ${timeOfDay}
        - Day: ${dayOfWeek}
        - User's mood/feeling: "${userMood}"
        
        Available movies: ${movieNames.join(', ')}
        
        Instructions:
        1. Analyze the user's mood and time context carefully
        2. The user input should be related to emotions, feelings, or movie preferences
        3. Select 5-6 movies that best match their current emotional state or preferences
        4. Consider factors like:
           - Time of day (morning = uplifting, evening = relaxing/thrilling)
           - Mood keywords (sad = comedy/uplifting, excited = action/adventure, tired = light comedy, horror = thriller/horror movies)
           - Weekend vs weekday preferences
        5. ONLY recommend movies that are in the provided movie list
        6. If the user's input doesn't seem related to emotions or movie preferences, respond with exactly: "INVALID_MOOD_INPUT"
        7. If no movies match the user's emotion, respond with exactly: "NO_MATCHES_FOUND"
        8. Return ONLY a plain JSON array of movie names exactly as they appear in the list
        9. Do not include any explanation, markdown formatting, or code blocks
        10. Do not wrap the response in \`\`\`json or any other formatting
        
        Example response format: ["Movie Name 1", "Movie Name 2", "Movie Name 3"]
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().trim();
        
        // Check if input is invalid
        if (text.includes('INVALID_MOOD_INPUT')) {
            return {
                success: false,
                error: "Please provide a mood, feeling, or movie preference for recommendations.",
                recommendations: [],
                isInvalidInput: true
            };
        }
        
        // Check if no matches found
        if (text.includes('NO_MATCHES_FOUND')) {
            const fallbackRecs = getFallbackRecommendations(viewingHistory, timeOfDay);
            return {
                success: true,
                noMatches: true,
                recommendations: fallbackRecs,
                timeOfDay,
                userMood,
                message: `Sorry, we couldn't find movies matching "${userMood}". Here are some recommendations based on ${viewingHistory.length > 0 ? 'your viewing history and' : ''} the current time (${timeOfDay}).`
            };
        }
        
        // Parse the JSON response
        try {
            // Clean the response text to handle markdown code blocks
            let cleanText = text;
            
            // Remove markdown code block syntax if present
            if (cleanText.includes('```json')) {
                cleanText = cleanText.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
            } else if (cleanText.includes('```')) {
                cleanText = cleanText.replace(/```\s*/g, '');
            }
            
            // Parse the cleaned JSON
            const recommendations = JSON.parse(cleanText);
            
            // Validate that all recommendations are in our movie list
            const validRecommendations = recommendations.filter(movie => movieNames.includes(movie));
            
            if (validRecommendations.length === 0) {
                const fallbackRecs = getFallbackRecommendations(viewingHistory, timeOfDay);
                return {
                    success: true,
                    noMatches: true,
                    recommendations: fallbackRecs,
                    timeOfDay,
                    userMood,
                    message: `No exact matches found for "${userMood}". Here are some ${viewingHistory.length > 0 ? 'personalized recommendations based on your viewing history and' : 'recommendations for'} ${timeOfDay.toLowerCase()} viewing.`
                };
            }
            
            return {
                success: true,
                recommendations: validRecommendations,
                timeOfDay,
                userMood
            };
        } catch (parseError) {
            console.error('Failed to parse response:', text);
            // Fallback: extract movie names manually if JSON parsing fails
            const fallbackRecommendations = extractMovieNamesFromText(text);
            
            if (fallbackRecommendations.length === 0) {
                const fallbackRecs = getFallbackRecommendations(viewingHistory, timeOfDay);
                return {
                    success: true,
                    noMatches: true,
                    recommendations: fallbackRecs,
                    timeOfDay,
                    userMood,
                    message: `Unable to parse recommendations for "${userMood}". Here are some ${viewingHistory.length > 0 ? 'suggestions based on your viewing history and' : 'recommendations for'} ${timeOfDay.toLowerCase()} time.`
                };
            }
            
            return {
                success: true,
                recommendations: fallbackRecommendations,
                timeOfDay,
                userMood
            };
        }
        
    } catch (error) {
        console.error('Error getting mood recommendations:', error);
        
        // Always return a fallback response structure
        const now = new Date();
        const timeOfDay = getTimeOfDay(now);
        const fallbackRecs = getFallbackRecommendations(viewingHistory, timeOfDay);
        
        return {
            success: true, // Set to true so frontend can show fallback recommendations
            error: error.message,
            recommendations: fallbackRecs,
            timeOfDay,
            userMood,
            message: `Unable to process "${userMood}" right now. Here are some ${viewingHistory.length > 0 ? 'personalized recommendations based on your viewing history and' : 'recommendations for'} ${timeOfDay.toLowerCase()} viewing.`,
            isFallback: true
        };
    }
}

/**
 * Get time of day description
 * @param {Date} date - Current date
 * @returns {string} - Time description
 */
function getTimeOfDay(date) {
    const hour = date.getHours();
    
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    return 'Night';
}

/**
 * Extract movie names from text if JSON parsing fails
 * @param {string} text - response text
 * @returns {Array} - Array of movie names
 */
function extractMovieNamesFromText(text) {
    const foundMovies = [];
    
    // Look for movies in quotes or common patterns
    movieNames.forEach(movie => {
        if (text.includes(movie)) {
            foundMovies.push(movie);
        }
    });
    
    return foundMovies.slice(0, 6); // Limit to 6 recommendations
}

/**
 * Get fallback recommendations based on viewing history and time of day
 * @param {Array} viewingHistory - User's viewing history
 * @param {string} timeOfDay - Current time of day
 * @returns {Array} - Default movie recommendations
 */
function getFallbackRecommendations(viewingHistory = [], timeOfDay) {
    console.log('Getting fallback recommendations:', { historyLength: viewingHistory.length, timeOfDay });
    
    // Get time-based recommendations as base
    const timeBasedRecs = getTimeBasedRecommendations(timeOfDay);
    
    // If user has viewing history, try to personalize
    if (viewingHistory.length > 0) {
        // Get recently watched movies (limit to 3)
        const recentMovies = viewingHistory.slice(0, 3).map(item => item.title || item);
        console.log('Recent movies from history:', recentMovies);
        
        // Filter out movies already in history to avoid duplicates
        const watchedTitles = viewingHistory.map(item => item.title || item);
        const unwatchedMovies = movieNames.filter(movie => !watchedTitles.includes(movie));
        
        // Try to find similar movies (this is a simple approach - could be enhanced)
        const similarMovies = findSimilarMovies(recentMovies, unwatchedMovies);
        
        // Combine similar movies with time-based recommendations
        let combinedRecs = [...similarMovies, ...timeBasedRecs];
        
        // Remove duplicates and limit to 6
        combinedRecs = [...new Set(combinedRecs)];
        
        console.log('Combined recommendations:', combinedRecs.slice(0, 6));
        return combinedRecs.slice(0, 6);
    }
    
    // If no viewing history, use time-based recommendations
    return getTimeBasedRecommendations(timeOfDay);
}

/**
 * Find similar movies based on recent viewing history
 * @param {Array} recentMovies - Recently watched movies
 * @param {Array} unwatchedMovies - Movies not yet watched
 * @returns {Array} - Similar movie recommendations
 */
function findSimilarMovies(recentMovies, unwatchedMovies) {
    console.log('Finding similar movies for:', recentMovies);
    
    // Simple similarity matching based on keywords and genres
    const genreKeywords = {
        'action': ['Spider-Man', 'Top Gun', 'Dune', 'The Batman', 'Avatar', 'Black Panther'],
        'comedy': ['The Super Mario Bros. Movie', 'Encanto', 'Luca', 'Soul', 'Moana'],
        'drama': ['Everything Everywhere All at Once', 'Joker', 'The Grand Budapest Hotel'],
        'horror': ['Hereditary', 'Get Out', 'The Conjuring', 'Midsommar', 'Scream VI'],
        'animation': ['Soul', 'Encanto', 'Moana', 'Luca', 'Coco', 'The Super Mario Bros. Movie'],
        'sci-fi': ['Dune', 'Avatar: The Way of Water', 'Blade Runner 2049', 'Spider-Man: No Way Home'],
        'superhero': ['Spider-Man: No Way Home', 'The Batman', 'Black Panther: Wakanda Forever', 'Guardians of the Galaxy Vol. 3']
    };
    
    const similarMovies = [];
    
    // For each recent movie, try to find similar unwatched movies
    recentMovies.forEach(recentMovie => {
        Object.entries(genreKeywords).forEach(([genre, movies]) => {
            if (movies.some(movie => movie.toLowerCase().includes(recentMovie.toLowerCase()) || recentMovie.toLowerCase().includes(movie.toLowerCase()))) {
                // Add other movies from the same genre that are unwatched
                const genreMatches = movies.filter(movie => 
                    unwatchedMovies.includes(movie) && 
                    !similarMovies.includes(movie) &&
                    !recentMovie.toLowerCase().includes(movie.toLowerCase())
                );
                similarMovies.push(...genreMatches.slice(0, 2)); // Limit to 2 per genre
            }
        });
    });
    
    // If no similar movies found, return a random selection of unwatched movies
    if (similarMovies.length === 0) {
        const shuffled = unwatchedMovies.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }
    
    console.log('Found similar movies:', similarMovies);
    return similarMovies.slice(0, 4); // Limit to 4 similar movies
}

/**
 * Get time-based recommendations
 * @param {string} timeOfDay - Current time of day
 * @returns {Array} - Time-appropriate movie recommendations
 */
function getTimeBasedRecommendations(timeOfDay) {
    const recommendations = {
        'Morning': ["Soul", "Encanto", "Moana", "The Grand Budapest Hotel", "Luca", "Coco"],
        'Afternoon': ["Spider-Man: No Way Home", "Top Gun: Maverick", "Guardians of the Galaxy Vol. 3", "The Super Mario Bros. Movie", "Avatar: The Way of Water"],
        'Evening': ["Dune", "The Batman", "Everything Everywhere All at Once", "Black Panther: Wakanda Forever", "Joker"],
        'Night': ["Blade Runner 2049", "Hereditary", "Get Out", "The Conjuring", "Midsommar", "Scream VI"]
    };
    
    return recommendations[timeOfDay] || recommendations['Evening'];
}

module.exports = {
    getMoodBasedRecommendations,
    // testValidation // Remove this in production
};