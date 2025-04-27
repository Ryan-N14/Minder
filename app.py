from flask import Flask, jsonify, request, session
from auth import auth_bp
from flask_cors import CORS
import json
import random
from rec_system import MovieRecommender


app = Flask(__name__)

app.secret_key = "secretKey"

recommender = MovieRecommender()


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


# Ideally this route is called after the user is logged in otherwise it will throw an error and not work
@app.route("/get_movies", methods=["GET", "OPTIONS" ])
def get_movies():
    selected_movies = recommender.get_next_batch(30)
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
