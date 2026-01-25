# FitTrack — Full-Stack Fitness Tracker (Assignment 3 Parts 1 & 2)

[cite_start]FitTrack is a fitness tracking web application built with **Node.js**, **Express.js**, and **MongoDB (Native Driver)**[cite: 1, 15]. 
[cite_start]This project demonstrates a full-stack production application with a RESTful API and a dynamic web interface capable of full CRUD operations[cite: 6, 12, 13].

------------------------------------------------------------------------

## Deployed URL
[cite_start]**Public URL:** [text](https://backend-final-project-fittrakker.onrender.com/) [cite: 21, 57]

------------------------------------------------------------------------

## Assignment Goals

### Part 1: Backend API
- [cite_start]Design and implement a backend API using Express.js [cite: 3]
- [cite_start]Connect to MongoDB using the native driver [cite: 3]
- [cite_start]Implement full CRUD operations and handle HTTP status codes [cite: 3]
- [cite_start]Apply filtering, sorting, and projection [cite: 3]

### Part 2: Deployment & Production
- [cite_start]Deploy the application to a public production environment [cite: 4, 19]
- [cite_start]Configure environment variables (`PORT`, `MONGO_URI`) for production [cite: 7, 26]
- [cite_start]Connect the frontend UI to the backend API via `fetch()` [cite: 5, 48]
- [cite_start]Demonstrate full CRUD functionality through the web interface [cite: 6, 59]

------------------------------------------------------------------------

## Team Members

- Almasuly Damir — Group SE-2429
- Amir Berdibek — Group SE-2429
- Qosaman Zarina — Group SE-2429
- Alikhan Korazbay — Group SE-2429
- Sharshiken Ali — Group SE-2429

------------------------------------------------------------------------

## Technologies Used

- [cite_start]**Node.js & Express.js** [cite: 15]
- [cite_start]**MongoDB** (Native Node.js Driver) 
- [cite_start]**Dotenv** (Environment Variable Management) [cite: 30]
- [cite_start]**HTML5, CSS3, JavaScript** (Fetch API) [cite: 46, 48]

------------------------------------------------------------------------

## Project Structure

```text
project-root/
├── database/
│   └── mongo.js        # MongoDB connection logic (Production ready) [cite: 13, 24]
├── routes/
│   └── workouts.js      # API routes for CRUD operations [cite: 13]
├── public/
│   └── styles.css       # Global styling
├── views/
│   ├── index.html       # Root interface (accessible via /) [cite: 58]
│   ├── workouts.html    # Main CRUD UI (Table/Catalog) [cite: 36, 38]
│   ├── about.html
│   ├── contact.html
│   └── 404.html         # Custom 404 handler [cite: 22]
├── server.js            # Entry point (uses process.env.PORT) [cite: 13, 23]
├── .gitignore           # Excludes node_modules and .env [cite: 53]
├── package.json
└── README.md
------------------------------------------------------------------------

## Installation & Run Instructions

### 1. Install dependencies

``` bash
npm install
```

------------------------------------------------------------------------

### 2. Make sure MongoDB is running

MongoDB must be running locally on:

    mongodb://127.0.0.1:27017

------------------------------------------------------------------------

### 3. Start the server

``` bash
node server.js
```

------------------------------------------------------------------------

### 4. Open the application

    http://localhost:3000

------------------------------------------------------------------------

## API Endpoints (Workouts)

### Get all workouts

    GET /api/workouts

------------------------------------------------------------------------

### Get workout by ID

    GET /api/workouts/:id

------------------------------------------------------------------------

### Create new workout

    POST /api/workouts

Example body:

``` json
{
  "title": "Leg Day",
  "type": "strength",
  "duration": 60,
  "calories": 450,
  "date": "2026-01-18"
}
```

------------------------------------------------------------------------

### Update workout

    PUT /api/workouts/:id

Example body:

``` json
{
  "duration": 75
}
```

------------------------------------------------------------------------

### Delete workout

    DELETE /api/workouts/:id

------------------------------------------------------------------------

## Advanced Query Features

### Filtering

    /api/workouts?type=strength

------------------------------------------------------------------------

### Sorting

    /api/workouts?sort=duration

------------------------------------------------------------------------

### Projection

    /api/workouts?fields=title,duration

------------------------------------------------------------------------

## HTTP Status Codes Used

-   **200 OK** --- Successful GET, PUT, DELETE\
-   **201 Created** --- Successful POST\
-   **400 Bad Request** --- Invalid ID or missing fields\
-   **404 Not Found** --- Record not found\
-   **500 Internal Server Error** --- Server or database error

------------------------------------------------------------------------

## Notes

-   MongoDB collections are created automatically on the first insert.\
-   SQLite and file-based databases are not used.

------------------------------------------------------------------------

## Assignment Information

This project is part of **Assignment 3 -- Part 1** and demonstrates:

-   REST API design\
-   MongoDB integration using native driver\
-   CRUD operations\
-   Query handling\
-   Proper backend project structure
