from flask import Flask, jsonify, request
from auth import auth_bp
from flask_cors import CORS
import json
import random


app = Flask(__name__)

app.secret_key = "secretKey"


# CORS configuration to allow a single origin
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": "Content-Type,Authorization"
    }
})

# Loading IMDB clean dataset 
with open ("Minder.json", "r", encoding="utf-8") as file:
    movies = json.load(file)


filtered_movies = [
    {
        "id": movie["tconst"],
        "title": movie["primaryTitle"],
        "year": int(movie["startYear"]) if movie["startYear"] else None,
        "runtime": int(movie["runtimeMinutes"]) if movie["runtimeMinutes"] else None,
        "rating": float(movie["averageRating"]) if movie["averageRating"] else None,
        "votes": int(movie["numVotes"]) if movie["numVotes"] else 0,
        "genres": movie["genres"].split(",") if movie["genres"] else [],
        "poster_url": f"https://img.omdbapi.com/?i={movie['tconst']}&apikey=YOUR_OMDB_API_KEY"  # Optional poster
    }
    for movie in movies
    if not movie["isAdult"] and movie["genres"]  # Exclude adult movies and empty genres
]

@app.route("/get_movies", methods=["GET", "OPTIONS" ])
def get_movies():
    print(f"🎬 Reached /get_movies with method {request.method}")

    if not filtered_movies or len(filtered_movies) < 1:
        return jsonify({"error": "No movies available"}), 500

    if request.method == "OPTIONS":
        return jsonify({"status": "CORS preflight OK"}), 200
    
    selected_movies = random.sample(filtered_movies, 10)
    return jsonify(selected_movies)






app.register_blueprint(auth_bp, url_prefix="/auth")


@app.before_request
def log_request():
    print(f"👀 Incoming request: {request.method} {request.path}")


@app.after_request
def after_request(response):
    print("✅ after_request fired")
    response.headers["Access-Control-Allow-Origin"] = "http://127.0.0.1:5500"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response

@app.errorhandler(Exception)
def handle_exception(e):
    print("🔥 Global error caught:", e)
    response = jsonify({"error": str(e)})
    response.status_code = 500
    response.headers["Access-Control-Allow-Origin"] = "http://127.0.0.1:5500"
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response

if(__name__ == "__main__"):
    app.run(debug=True)
