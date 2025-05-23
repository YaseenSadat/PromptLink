"""
===================================================================
  main.py — Entry point for the FastAPI backend application
===================================================================

This file initializes and configures the FastAPI server. It performs
the following core tasks:

1. Creates the FastAPI application instance.
2. Registers the main API router from the app's routing module.
3. Enables CORS (Cross-Origin Resource Sharing) to allow communication
   between the frontend (e.g., React/Vite app) and this backend API.

This is the central configuration file that ties together routing
and middleware to start the backend server.

===================================================================
"""

from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware
from backend.app.router import router

# Instantiate the FastAPI application
app = FastAPI()

# Include the API routes defined in the router module
app.include_router(router)

# Add CORS (Cross-Origin Resource Sharing) middleware to the FastAPI app
# This configuration allows requests from any origin and permits credentials, all methods, and all headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # Accept requests from all domains (use with caution in production)
    allow_credentials=True,    # Allow cookies, authorization headers, and TLS client certificates
    allow_methods=["*"],       # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],       # Allow all headers in incoming requests
)
