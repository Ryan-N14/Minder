from flask import Flask, jsonify, request, session
from auth import auth_bp
from flask_cors import CORS
import os
import json
import random
from rec_system import build_recommender_from_supabase, get_user_preferences
from supabase import create_client


app = Flask(__name__)

app.secret_key = "secretKey"

# Initialize Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") 
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)




# CORS configuration to allow a single origin
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": "Content-Type,Authorization"
    }
})


# ------------------------ ROUTES -------------------------
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

app.register_blueprint(auth_bp, url_prefix="/auth")




if(__name__ == "__main__"):
    app.run(debug=True)
