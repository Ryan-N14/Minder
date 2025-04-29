import json
import numpy as np
from collections import Counter

# Weights for different features
WEIGHTS = {
    'genres': 0.4,    
    'year': 0.2,
    'runtime': 0.1,   
    'rating': 0.3     
}

# Tolerances for numeric features
TOLERANCES = {
    'year': 5,
    'runtime': 10,
    'rating': 0.5
}

class MovieRecommender:
    def __init__(self):
        self.all_movies = self._load_and_preprocess()
        self.liked_movies = []
        self.disliked_movies = []
        
    def _load_and_preprocess(self):
        """Load and preprocess movie data once during initialization"""
        with open("Minder.json", "r", encoding="utf-8") as f:
            raw_movies = json.load(f)
        
        return [self._extract_features(m) for m in raw_movies if not m.get("isAdult")]
    
    def _extract_features(self, movie):
        """Enhanced feature extraction with data validation"""
        features = {
            'id': movie.get('tconst'),
            'title': movie.get('primaryTitle'),
            'genres': set(movie.get('genres', '').split(',') if movie.get('genres') else []),
            'year': self._safe_int_conversion(movie.get('startYear')),
            'runtime': self._safe_int_conversion(movie.get('runtimeMinutes')),
            'rating': float(movie.get('averageRating')) if movie.get('averageRating') is not None else None,
            'votes': self._safe_int_conversion(movie.get('numVotes'), default=0)
        }
        return features
    
    def _safe_int_conversion(self, value, default=None):
        """Safely convert various value types to integer"""
        if value is None:
            return default
            
        try:
            if isinstance(value, str) and value.isdigit():
                return int(value)
            elif isinstance(value, (int, float)):
                return int(value)
            else:
                return default
        except (ValueError, TypeError):
            return default

    def _create_user_profile(self):
        """Create normalized user preference profile"""
        if not self.liked_movies:
            return None
            
        profile = {
            'genres': Counter(),
            'year': [],
            'runtime': [],
            'rating': []
        }

        for movie in self.liked_movies:
            profile['genres'].update(movie['genres'])
            if movie['year']: profile['year'].append(movie['year'])
            if movie['runtime']: profile['runtime'].append(movie['runtime'])
            if movie['rating']: profile['rating'].append(movie['rating'])

        # Calculate averages and normalize
        return {
            'genres': {g: count/len(self.liked_movies) for g, count in profile['genres'].items()},
            'year': np.mean(profile['year']) if profile['year'] else None,
            'runtime': np.mean(profile['runtime']) if profile['runtime'] else None,
            'rating': np.mean(profile['rating']) if profile['rating'] else None
        }
    
    def _calculate_similarity(self, movie, user_profile):
        """Calculate weighted similarity score using provided weights"""
        score = 0.0
        
        # Genre similarity 
        if user_profile['genres']:
            genre_overlap = len(movie['genres'] & set(user_profile['genres'].keys()))
            total_unique = len(movie['genres'] | set(user_profile['genres'].keys()))
            score += WEIGHTS['genres'] * (genre_overlap / total_unique if total_unique else 0)

        # Temporal similarity 
        if movie['year'] and user_profile['year']:
            year_diff = abs(movie['year'] - user_profile['year'])
            score += WEIGHTS['year'] * (1 - min(year_diff / TOLERANCES['year'], 1))

        # Runtime similarity
        if movie['runtime'] and user_profile['runtime']:
            runtime_diff = abs(movie['runtime'] - user_profile['runtime'])
            score += WEIGHTS['runtime'] * (1 - min(runtime_diff / TOLERANCES['runtime'], 1))

        # Rating similarity
        if movie['rating'] and user_profile['rating']:
            rating_diff = abs(movie['rating'] - user_profile['rating'])
            score += WEIGHTS['rating'] * (1 - min(rating_diff / TOLERANCES['rating'], 1))

        return score

    def update_preferences(self, movie_id, liked=True):
        """Track user preferences as they swipe"""
        movie = next((m for m in self.all_movies if m['id'] == movie_id), None)
        if not movie:
            return False
            
        if liked:
            self.liked_movies.append(movie)
        else:
            self.disliked_movies.append(movie)
        return True

    def get_next_batch(self, batch_size=30):
        """Get optimized batch of movies based on current preferences"""
        user_profile = self._create_user_profile()
        
        # If we don't have enough likes to form a profile, return random movies
        if not user_profile:
            return self._get_random_movies(batch_size)
        
        # Otherwise, score all unwatched movies
        seen_ids = {m['id'] for m in self.liked_movies + self.disliked_movies}
        scored_movies = []
        
        for movie in self.all_movies:
            if movie['id'] not in seen_ids:
                similarity = self._calculate_similarity(movie, user_profile)
                scored_movies.append((movie, similarity))
        
        # Sort by similarity score (descending)
        scored_movies.sort(key=lambda x: x[1], reverse=True)
        
        # Return top-N recommendations
        return [self._format_movie(movie) for movie, _ in scored_movies[:batch_size]]
    
    def _get_random_movies(self, batch_size=30):
        """Get random movies when we don't have user preferences yet"""
        import random
        
        seen_ids = {m['id'] for m in self.liked_movies + self.disliked_movies}
        unwatched = [m for m in self.all_movies if m['id'] not in seen_ids]
        
        # If we have fewer unwatched movies than batch size, return all
        if len(unwatched) <= batch_size:
            selected = unwatched
        else:
            selected = random.sample(unwatched, batch_size)
            
        return [self._format_movie(movie) for movie in selected]
    
    def _format_movie(self, movie):
        """Format a movie for API response"""
        return {
            "id": movie['id'],
            "title": movie['title'],
            "year": movie['year'],
            "runtime": movie['runtime'],
            "rating": movie['rating'],
            "votes": movie['votes'],
            "genres": list(movie['genres']),
            "poster_url": f"https://img.omdbapi.com/?i={movie['id']}&apikey=c4ae0c8a"
        }

# ------------ Supabase Helper Functions ------------

def get_user_preferences(user_id, supabase):
    # This function calls and gather all of the movies from our database
    liked = supabase.table("user_inputs").select("movie_id").eq("user_id", user_id).eq("liked", True).execute() #liked movies
    
    disliked = supabase.table("user_inputs").select("movie_id").eq("user_id", user_id).eq("liked", False).execute() #disliked movies
    return [r['movie_id'] for r in liked.data], [r['movie_id'] for r in disliked.data]



# Function builds a recommender for each user depending on their preferences
def build_recommender_from_supabase(user_id, supabase):
    liked_ids, disliked_ids = get_user_preferences(user_id, supabase)
    recommender = MovieRecommender()
    for movie_id in liked_ids:
        recommender.update_preferences(movie_id, liked=True)
    for movie_id in disliked_ids:
        recommender.update_preferences(movie_id, liked=False)
    return recommender