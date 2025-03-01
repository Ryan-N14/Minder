# auth.py
# Purpose: Handle user authentication (login and signup)
# 
# Created by Ryan Nguyen Feb 23 2024
#

import os
from dotenv import load_dotenv
from flask import Blueprint, request, jsonify
from supabase import create_client, Client

auth_bp = Blueprint("auth", __name__)

load_dotenv()

# Grabbing key and url from .env file
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") 

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@auth_bp.route("/signup", methods=["POST"])
def signup():
    try:
        data = request.json
        email = data.get("email")
        password = data.get("confirmPassword")  # Ensure field name matches frontend

        if not email or not password:
            return jsonify({"error": "Email and password are required"}), 400

        response = supabase.auth.sign_up({"email": email, "password": password})

        if response.user is None:
            return jsonify({"error": response.error.message}), 400

        user_data = {
            "id": response.user.id,
            "email": response.user.email
        }

        return jsonify({"message": "Signup successful!", "user": user_data}), 200

    except Exception as e:
        print(f"Signup error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500








