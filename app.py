from flask import Flask, jsonify, request, session
from auth import auth_bp
from flask_cors import CORS
import os
import json
import random
from rec_system import build_recommender_from_supabase, get_user_preferences
from supabase import create_client
import requests


app = Flask(__name__)

app.secret_key = "secretKey"

# Initialize Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") 
SERVICE_KEY = os.getenv("SERVICE_KEY")
supabase = create_client(SUPABASE_URL, SERVICE_KEY)




# CORS configuration to allow multiple origins
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": ["http://127.0.0.1:5000", "http://127.0.0.1:5500"],
        "methods": ["GET", "POST", "DELETE", "OPTIONS"],
        "allow_headers": "Content-Type,Authorization",
        "supports_credentials": True
    }
})


# ------------------------ ROUTES -------------------------
@app.before_request
def log_request():
    print(f"👀 Incoming request: {request.method} {request.path}")


@app.after_request
def after_request(response):
    print("✅ after_request fired")
    origin = request.headers.get('Origin')
    if origin in ['http://127.0.0.1:5000', 'http://127.0.0.1:5500']:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,DELETE,OPTIONS"
    return response

@app.errorhandler(Exception)
def handle_exception(e):
    print("🔥 Global error caught:", e)
    response = jsonify({"error": str(e)})
    response.status_code = 500
    origin = request.headers.get('Origin')
    if origin in ['http://127.0.0.1:5000', 'http://127.0.0.1:5500']:
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,DELETE,OPTIONS"
    return response



# ----------------------------- ENDPOINTS ---------------------------

# Ideally this route is called after the user is logged in otherwise it will throw an error and not work
@app.route("/get_movies", methods=["GET", "OPTIONS" ])
def get_movies():
    if request.method == "OPTIONS":
        # Handle CORS preflight request properly
        response = jsonify({"status": "OK"})
        response.status_code = 200
        return response

    user_id = session["user_id"]
    if not user_id:
        print("user not found")
        return jsonify({"error: user not logged in"}), 401

    #Create recommender
    recommender = build_recommender_from_supabase(user_id, supabase)
    print("Building recommender")

    # grabbing total liked to see if its a new user or already a member
    liked_id, disliked_id = get_user_preferences(user_id, supabase)
    total_swipes = len(liked_id) + len(disliked_id)

    if(total_swipes < 10):
        batch_size = 10
    else:
        batch_size = 30


    batch = recommender.get_next_batch(batch_size)
    # Returning the batch of movies

    print("Returning...")
    return jsonify(batch)


# This route is for the explore page mainly
@app.route("/feedback", methods=["POST"])
def feedback():
    # Save user choice after every swipe (IE left or right)

    user_id = session["user_id"]
    if not user_id:
        return jsonify({"error: user not logged in"}), 401

    data = request.get_json()
    movie_id = data.get("movie_id")
    liked = data.get("liked", True) # defaults to True if there's no liekd

    supabase.table("user_inputs").insert({
        "user_id": user_id,
        "movie_id": movie_id,
        "liked": liked
    }).execute()


    return jsonify({"message" : "Feedback saved sucessfully"}), 200



@app.route("/save_movie", methods=["POST"])
def save_movie():
    # Saves selected movie and add it to database

    #user id
    user_id = session["user_id"]
    if not user_id:
        return jsonify({"error: user not logged in"}), 401
    
    #grabbing data
    data = request.get_json()
    movie_id = data.get("movie_id")

    # inserting data into database
    supabase.table("user_watchlist").insert({
        "user_id": user_id,
        "movie_id": movie_id,
    }).execute()

    return jsonify({"message": "Movie has been saved"}), 200





@app.route("/fetch_movies", methods=["GET"])
def get_saved_movies():

    user_id = session["user_id"]
    if not user_id:
        return jsonify({"error": "Not logged in"}), 401

    try:
        response = supabase.table("user_watchlist").select("movie_id").eq("user_id", user_id).execute()

        movie_ids = [r["movie_id"] for r in response.data]
        
        # Now load full movie details from your Minder.json
        from rec_system import MovieRecommender
        recommender = MovieRecommender()

        saved_movies = []
        for movie in recommender.all_movies:
            if movie['id'] in movie_ids:
                saved_movies.append(recommender._format_movie(movie))

        return jsonify(saved_movies)

    except Exception as e:
        return jsonify({"error": str(e)}), 500




@app.route("/delete_movie", methods=["DELETE", "OPTIONS"])
def deleteMovies():
    # Handle CORS preflight request
    if request.method == "OPTIONS":
        response = jsonify({"status": "CORS preflight OK"})
        response.headers["Access-Control-Allow-Origin"] = "http://127.0.0.1:5000"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response.headers["Access-Control-Allow-Methods"] = "DELETE,OPTIONS"
        return response

    # Get movie_id from request data
    data = request.get_json()
    movie_id = data.get("movie_id")
    
    if not movie_id:
        return jsonify({"error": "Movie ID is required"}), 400

    user_id = session.get("user_id") # Grabbing User
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    try:
        print(f"Attempting to delete movie {movie_id} for user {user_id}")
        
        # First check if the movie exists in the user's watchlist
        check_response = supabase.table("user_watchlist").select("*").eq("user_id", user_id).eq("movie_id", movie_id).execute()
        
        if not check_response.data:
            return jsonify({"error": "Movie not found in watchlist"}), 404
            
        print("Movie found in watchlist, proceeding with delete")
        
        # Perform the delete operation
        response = supabase.table("user_watchlist").delete().match({
            "user_id": user_id, 
            "movie_id": movie_id
        }).execute()

        print("Delete response:", response)

        # Check if the response contains any errors
        if hasattr(response, 'error') and response.error:
            print("Supabase error:", response.error)
            return jsonify({
                "error": "Delete failed", 
                "details": str(response.error)
            }), 500

        return jsonify({"message": "Movie deleted successfully"}), 200

    except Exception as e:
        print("Exception during delete:", str(e))
        return jsonify({
            "error": "Delete failed", 
            "details": str(e)
        }), 500


@app.route("/search_movies", methods=["GET", "OPTIONS"])
def search_movies():
    if request.method == "OPTIONS":
        response = jsonify({"status": "CORS preflight OK"})
        response.headers["Access-Control-Allow-Origin"] = "http://127.0.0.1:5000"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET,OPTIONS"
        return response

    try:
        # Get search query and pagination parameters
        query = request.args.get("query", "").lower()
        page = int(request.args.get("page", 1))
        per_page = int(request.args.get("per_page", 20))
        
        print(f"Search query: {query}")
        
        if not query or len(query) < 2:
            return jsonify({"movies": []})

        # Load movies from your recommender
        from rec_system import MovieRecommender
        recommender = MovieRecommender()
        
        print(f"Total movies loaded: {len(recommender.all_movies)}")
        
        # Search through movies (case-insensitive)
        results = []
        for movie in recommender.all_movies:
            try:
                # Search in title and genres
                title_match = query in movie['title'].lower()
                genre_match = any(query in genre.lower() for genre in movie['genres'])
                
                if title_match or genre_match:
                    # Format movie to match frontend expectations
                    formatted_movie = {
                        'movie_id': movie['id'],
                        'title': movie['title'],
                        'poster_url': f"https://img.omdbapi.com/?i={movie['id']}&apikey=c4ae0c8a",
                        'genres': list(movie['genres']),
                        'year': movie['year'],
                        'rating': movie['rating']
                    }
                    results.append(formatted_movie)
            except (KeyError, AttributeError) as e:
                print(f"Error processing movie: {str(e)}")
                continue

        print(f"Found {len(results)} matching movies")
        
        # Calculate pagination
        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        paginated_results = results[start_idx:end_idx]

        return jsonify({
            "movies": paginated_results,
            "total": len(results),
            "page": page,
            "per_page": per_page,
            "total_pages": (len(results) + per_page - 1) // per_page
        })

    except Exception as e:
        print(f"Search error: {str(e)}")
        return jsonify({
            "movies": [],
            "error": "An error occurred while searching movies"
        }), 500


def get_user_email(user_id):
    headers = {
        "apikey": SERVICE_KEY,
        "Authorization": f"Bearer {SERVICE_KEY}"
    }
    url = f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}"

    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json().get("email")
    return None

@app.route("/get_profile", methods=["GET", "OPTIONS"])
def get_profile():
    if request.method == "OPTIONS":
        response = jsonify({"status": "CORS preflight OK"})
        response.headers["Access-Control-Allow-Origin"] = "http://127.0.0.1:5000"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET,OPTIONS"
        return response

    try:
        user_id = "4dadcc40-5d3b-4d67-8c52-c2c20b43166e"  # Hardcoded for testing
        print(f"User ID: {user_id}")
        if not user_id:
            return jsonify({"error": "Not logged in"}), 401

        # Get profile data
        print("Fetching profile data from Supabase...")
        profile_response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        print(f"Profile response: {profile_response}")
        
        profile_data = profile_response.data[0] if profile_response.data else {}
        print(f"Profile data: {profile_data}")

        # Get email using Admin API
        print("Fetching user email from Supabase Admin API...")
        email = get_user_email(user_id)
        print(f"User email: {email}")

        return jsonify({
            "first_name": profile_data.get("first_name", ""),
            "last_name": profile_data.get("last_name", ""),
            "email": email or ""
        })

    except Exception as e:
        print(f"Profile fetch error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": "An error occurred while fetching profile"}), 500

@app.route("/update_profile", methods=["POST", "OPTIONS"])
def update_profile():
    if request.method == "OPTIONS":
        response = jsonify({"status": "CORS preflight OK"})
        origin = request.headers.get('Origin')
        if origin in ['http://127.0.0.1:5000', 'http://127.0.0.1:5500']:
            response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response.headers["Access-Control-Allow-Methods"] = "POST,OPTIONS"
        return response

    try:
        user_id = session.get("user_id")
        if not user_id:
            return jsonify({"error": "Not logged in"}), 401

        data = request.get_json()
        first_name = data.get("firstName")
        last_name = data.get("lastName")
        
        if not first_name or not last_name:
            return jsonify({"error": "First name and last name are required"}), 400

        # Check if profile exists
        profile_response = supabase.table("profiles").select("*").eq("id", user_id).execute()
        
        if not profile_response.data:
            # Create new profile
            print("Creating new profile...")
            response = supabase.table("profiles").insert({
                "id": user_id,
                "first_name": first_name,
                "last_name": last_name
            }).execute()
        else:
            # Update existing profile
            print("Updating existing profile...")
            response = supabase.table("profiles").update({
                "first_name": first_name,
                "last_name": last_name
            }).eq("id", user_id).execute()

        if not response.data:
            print(f"Profile update/insert failed: {response}")
            return jsonify({"error": "Failed to update profile"}), 500

        return jsonify({
            "message": "Profile updated successfully",
            "first_name": first_name,
            "last_name": last_name
        })

    except Exception as e:
        print(f"Profile update error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")
        return jsonify({"error": "An error occurred while updating profile"}), 500


app.register_blueprint(auth_bp, url_prefix="/auth")




if(__name__ == "__main__"):
    app.run(debug=True)
