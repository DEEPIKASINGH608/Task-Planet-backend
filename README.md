TaskPlanet-API
1. Overview
Project Name: TaskPlanet Backend API

Primary Goal: Manage user authentication, post data persistence, and secure server-side logic.

Live API Base URL: https://task-planet-backend-mu.vercel.app

Architecture: RESTful API built with Node.js and Express.

2. Technical Features
Database Integration: Utilizes Mongoose ODM for structured data modeling in MongoDB Atlas.

Security & CORS: Configured Cross-Origin Resource Sharing to allow only authorized frontend requests.

Middleware Logic: Includes error-handling middleware to ensure the server doesn't crash on invalid requests.

Serverless Execution: Optimized for Vercel Serverless Functions, ensuring high availability and low cost.

3. API Documentation (Endpoints)
Authentication:

POST /api/auth/register: Creates a new user profile.

POST /api/auth/login: Validates credentials and returns a user session.

Posts Management:

GET /api/posts: Retrieves the latest posts from the database.

POST /api/posts: Submits a new post to the cloud.

PUT /api/posts/:id: Updates existing post content.

DELETE /api/posts/:id: Removes a post from the database.

4. Local Setup & Installation
Step 1: Clone Repo git clone https://github.com/DEEPIKASINGH608/Task-Planet-backend.git

Step 2: Install Dependencies npm install

Step 3: Setup Environment Variables Create a .env file: MONGO_URI=your_mongodb_connection_string PORT=5000

Step 4: Run Server npm run dev (using Nodemon for hot-reloads)

5. Deployment Configuration (Vercel)
Framework: Optimized for the Node.js runtime.

Variable Injection: The MONGO_URI is securely injected via Vercel’s Project Settings, keeping sensitive credentials out of the public code.