# FitTrack --- Backend API (Assignment 3 Part 1)

FitTrack is a fitness tracking web application backend built with
**Node.js**, **Express.js**, and **MongoDB (Native Driver)**.\
This assignment focuses on building a RESTful API with full **CRUD
operations**, database integration, and advanced query features such as
filtering, sorting, and projection.

------------------------------------------------------------------------

## Assignment Goal

The main goal of **Assignment 3 -- Part 1** is to:

-   Design and implement a backend API using Express.js\
-   Connect the application to MongoDB using the native driver\
-   Implement full CRUD operations\
-   Use MongoDB ObjectId correctly\
-   Apply filtering, sorting, and projection\
-   Handle validation and HTTP status codes

------------------------------------------------------------------------

## Project Topic

**Fitness Tracking System (FitTrack)**

The system allows users to store workout data, track training sessions,
and manage fitness progress using a REST API.

------------------------------------------------------------------------

## Team Members

-   Almasuly Damir --- Group SE-2429\
-   Amir Berdibek --- Group SE-2429\
-   Qosaman Zarina --- Group SE-2429\
-   Alikhan Korazbay --- Group SE-2429\
-   Sharshiken Ali --- Group SE-2429

------------------------------------------------------------------------

## Technologies Used

-   Node.js\
-   Express.js\
-   MongoDB (Native Node.js Driver)\
-   HTML5\
-   CSS3

------------------------------------------------------------------------

## Project Structure

    project-root/
    ├── database/
    │   └── mongo.js
    ├── routes/
    │   └── workouts.js
    ├── public/
    │   └── styles.css
    ├── views/
    │   ├── index.html
    │   ├── about.html
    │   ├── contact.html
    │   ├── success.html
    │   └── 404.html
    ├── server.js
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
