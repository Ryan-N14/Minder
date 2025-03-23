from flask import Flask, jsonify
from auth import auth_bp
from flask_cors import CORS
import json
import random


app = Flask(__name__)
CORS(app);

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

@app.route("/get_movies", methods=["GET"])
def get_movies():
    selected_movies = random.sample(filtered_movies, 10)
    return jsonify(selected_movies)

app.register_blueprint(auth_bp, url_prefix="/auth")

if(__name__ == "__main__"):
    app.run(debug=True)
