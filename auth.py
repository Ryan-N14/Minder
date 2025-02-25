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
    data = request.json
    print("Sucess to backend")
    print("Data" + data.get("email"))
    return jsonify({"message": "Signup successful!"})



