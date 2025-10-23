Prakriti Analysis Health App

Analysis screenshot link :https://github.com/Akash-Tiwari-alfa/HealthApp-Project/blob/main/Screenshot%20From%202025-10-24%2003-05-04.png?raw=true.

A full-stack web application designed for personalized health and wellness based on Ayurvedic principles. It allows users to register, discover their dominant dosha (Vata, Pitta, Kapha) through an interactive quiz, and receive custom diet plans and daily routines.

✨ Features

Secure User Authentication: Users can register and log in with a secure, token-based (JWT) system.

Prakriti Analysis Quiz: An interactive quiz to help users determine their dominant dosha.

Personalized Content: The app dynamically displays diet charts and daily routines based on the user's quiz results (Vata, Pitta, or Kapha).

Dynamic User Profile: Users can save and update personal details (name, age) and health information (height, weight, conditions).

Real-time Feedback System: A "Follow-ups" section where users can add notes, which are saved and displayed instantly.

Full-Stack Architecture: Built with a React frontend, Node.js/Express backend, and MongoDB database.

💻 Tech Stack

Frontend: React (with Hooks & Functional Components)

Backend: Node.js, Express

Database: MongoDB Atlas (Cloud Database)

Styling: Tailwind CSS (via CDN)

Authentication: JWT (JSON Web Tokens) & bcrypt.js for password hashing

Icons: lucide-react

📁 Project Structure

Your project is organized into two main parts, all within one repository:

HealthApp-Project/
├── backend/
│   ├── node_modules/
│   ├── package.json
│   └── server.js         <-- The backend server (Node.js/Express)
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   │   └── index.html    <-- Tailwind CSS is linked here
│   ├── src/
│   │   └── App.js        <-- The entire React application
│   └── package.json
│
└── README.md             <-- You are here!


🚀 How to Run This Project Locally

Follow these steps to get the application running on your local machine (e.g., Ubuntu).

Prerequisites

Node.js (which includes npm)

Git

A free MongoDB Atlas account

Step 1: Clone the Repository

First, get the code from GitHub.

# Clone this repository to your local machine
git clone [https://github.com/YourUsername/HealthApp-Project.git](https://github.com/YourUsername/HealthApp-Project.git)

# Go into the new project folder
cd HealthApp-Project


Step 2: Set Up the Backend (Terminal 1)

The backend server connects to your database and handles all logic.

# Go into the backend folder
cd backend

# Install all required packages
npm install

# IMPORTANT: Configure Your Database
# 1. Open the server.js file
nano server.js

# 2. Find the line: const MONGO_URI = "..."
# 3. Replace the placeholder with your own MongoDB Atlas connection string.
#    (Remember to use your simple password with no special characters!)

# 4. Save and exit nano (Ctrl+O, Enter, Ctrl+X)


Step 3: Set Up the Frontend (Terminal 2)

The frontend is the React app that your users will see.

# Open a new, separate terminal window
# Go to the project folder
cd ~/HealthApp-Project/frontend

# Install all required packages
npm install


Note: The backend port is set to 5001 and the frontend is pre-configured to connect to it. If you change the port in backend/server.js, you must also change the BASE_URL in frontend/src/App.js to match.

▶️ Running the Application

You must have two terminals open and running at the same time.

Terminal 1: Run the Backend

# Go to your backend folder
cd ~/HealthApp-Project/backend

# Start the server
node server.js

# You MUST see this output:
# --- INITIALIZING SERVER (VERSION 3 DEBUG) ---
# Connected to MongoDB Atlas!
# Backend server is running on http://localhost:5001


Terminal 2: Run the Frontend

# Go to your frontend folder
cd ~/HealthApp-Project/frontend

# Start the React app
npm start

# Your browser will automatically open to http://localhost:3000


You can now register, log in, and use the app!

🖼️ Application Screenshots:

Login Page :https://github.com/Akash-Tiwari-alfa/HealthApp-Project/blob/main/Screenshot%20From%202025-10-24%2003-06-27.png?raw=true

Prakriti Analysis Quiz:https://github.com/Akash-Tiwari-alfa/HealthApp-Project/blob/main/Screenshot%20From%202025-10-24%2003-05-59.png?raw=true





Personalized Diet Plan:https://github.com/Akash-Tiwari-alfa/HealthApp-Project/blob/main/Screenshot%20From%202025-10-24%2003-05-39.png?raw=true

User Profile Page:https://github.com/Akash-Tiwari-alfa/HealthApp-Project/blob/main/Screenshot%20From%202025-10-24%2003-05-22.png?raw=true



