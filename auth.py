# auth.py
# Purpose: Handle user authentication (login and signup)
# 
# Created by Ryan Nguyen Feb 23 2024
#


import os
from dotenv import load_dotenv
from flask import Blueprint, request, jsonify, session
from supabase import create_client, Client
from flask_cors import CORS

auth_bp = Blueprint("auth", __name__)
CORS(auth_bp, supports_credentials=True, resources={
    r"/*": {
        "origins": "http://127.0.0.1:5500",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": "Content-Type,Authorization",
        "supports_credentials": True
    }
})

load_dotenv()

# Grabbing key and url from .env file
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") 
SERVICE_KEY = os.getenv("SERVICE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)



# ---------- Log out endpoint -----------------

@auth_bp.route("/logout", methods=["POST", "OPTIONS"])
def logout():
    if request.method == "OPTIONS":
        return jsonify({"status": "CORS preflight OK"}), 200
    
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200





# this route signup the user and creates a session for that user.
@auth_bp.route("/signup", methods=["POST", "OPTIONS"])
def signup():
    if request.method == "OPTIONS":
        return jsonify({"status": "CORS preflight OK"}), 200

    try:
        data = request.json
        email = data.get("email")
        password = data.get("password")  # Ensure field name matches frontend
        first_name = data.get("firstName")
        last_name = data.get("lastName")

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        response = supabase.auth.sign_up({"email": email, "password": password})


        if response.user is None:
            print("Sign-up failure:", response.error.message)
            return jsonify({"error": response.error.message}), 400

        user = response.user.id

        if user:
            session["user_id"] = user # grabbing user ID to save  
            #inserting to profile table 
            supabase.table("profiles").insert({
            "id": user,
            "first_name": first_name,
            "last_name": last_name,
            }).execute()
            return jsonify({'redirect': '/templates/suggestion.html'}), 200

        return jsonify({'error': 'Signup failed'}), 400
    except Exception as e:
        print(f"Signup error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


# this route login users
@auth_bp.route("/login", methods=["POST", "OPTIONS"])
def login():
    print("login endpoint called")
    if request.method == "OPTIONS":
        return jsonify({"status": "CORS preflight OK"}), 200

    
    data = request.json
    email = data.get('email')
    password = data.get('password')


    #login user in using suopabase
    try:
        res = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password,
        })

        user = res.user.id

        print("User", user)

        #Check if user exist, after creates a session
        if user:
            session["user_id"] = user
            return jsonify({
                'message': 'Login successful',
                'user_email': res.user.email,  # ✅ Renamed to avoid triggering user-object serialization
                'redirect': '/templates/explore.html'
            }), 200
        else:
            return jsonify({'error': 'Invalid login'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 401



# This route is only used to save intial feedback
@auth_bp.route('/savefeedback', methods=["POST", "OPTIONS"])
def save_feedback():
    if request.method == "OPTIONS":
        return jsonify({"status": "CORS preflight OK"}), 200
    


    #grabbing user ID
    user_id = session["user_id"]
    if not user_id:
        print("❌ No user ID found in session")
        return jsonify({"error": "User not in session"}), 401


    #grabbing feedback data
    feedback = request.json.get("feedback", [])
    print("📥 Feedback received:", feedback)

    try:
        entries = []

        for items in feedback:
            entries.append ({
                "user_id": user_id,
                "movie_id": items["movie_id"],
                "liked": items["liked"] 
            })

        print("📦 Supabase entries to insert:", entries)
        
        response = supabase.table("user_inputs").insert(entries).execute()
        print("🟢 Supabase response:", response)

        if hasattr(response, "status_code") and response.status_code >= 400:
            return jsonify({
                "error": "Insert failed",
                "details": str(response)
            }), 500

        if not response.data or len(response.data) != len(entries):
            return jsonify({
                "error": "Unexpected insert result",
                "details": str(response.data)
            }), 500



        return jsonify({"redirect": "/templates/explore.html"}), 200
    except Exception as e:
        return jsonify({"error" : str(e)}), 500








