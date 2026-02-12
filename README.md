# FitTrack Final Project

Production-ready fitness tracking web app built with Node.js, Express, and MongoDB.

## Overview
FitTrack is a full-stack web application where users register, login, and manage workout records.
The app includes session authentication, role-based authorization, secure API endpoints, and a responsive web UI.

## Tech Stack
- Node.js
- Express.js
- MongoDB (native driver)
- express-session + connect-mongo
- bcrypt
- HTML/CSS/Vanilla JavaScript

## Final Project Features
- Authentication with server sessions
- Password hashing with bcrypt
- Role-based access control (`user`, `admin`)
- Ownership rules: regular users can modify only their own workouts
- Admin extended permissions (view all workouts + admin summary)
- Protected write endpoints (`POST`, `PUT`, `DELETE`)
- Pagination for large datasets (`page`, `limit`)
- Filtering, sorting, projection for workout list
- Environment variables for secrets/config

## Project Structure
```text
Assignment_3_1/
  controllers/
    authController.js
    workoutsController.js
  database/
    mongo.js
  middleware/
    auth.js
  models/
    userModel.js
    workoutModel.js
  public/
    styles.css
  routes/
    auth.js
    workouts.js
  views/
    index.html
    workouts.html
    login.html
    register.html
    about.html
    contact.html
    404.html
  server.js
  seed.js
  package.json
  README.md
```

## Environment Variables
Create `.env` in the project root:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
SESSION_SECRET=your_strong_session_secret
NODE_ENV=development
```

## Installation
```bash
npm install
```

## Run
```bash
npm start
```

Server starts at:
- `http://localhost:3000`

## Seed Sample Workouts (optional)
```bash
node seed.js
```

## Main Routes (UI)
- `/` - Home page
- `/register` - Register
- `/login` - Login
- `/workouts` - Workout dashboard
- `/about` - About page
- `/contact` - Contact page

## API Endpoints
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/status`
- `GET /api/auth/users` (admin only)

### Workouts
- `GET /api/workouts` (authenticated, paginated)
- `GET /api/workouts/:id` (authenticated)
- `POST /api/workouts` (authenticated)
- `PUT /api/workouts/:id` (owner/admin)
- `DELETE /api/workouts/:id` (owner/admin)
- `GET /api/workouts/admin/summary` (admin only)

## Query Parameters for `GET /api/workouts`
- `page` - page number (default: `1`)
- `limit` - items per page (default: `10`, max: `100`)
- `type` - filter by workout type
- `sort` - sort field (`duration`, `calories`, `date`, `title`, `difficulty`)
- `order` - `asc` or `desc`
- `fields` - projection, e.g. `title,duration`

Example:
```http
GET /api/workouts?page=1&limit=10&type=cardio&sort=duration&order=desc
```

## Security Notes
- Session store is persisted in MongoDB (`connect-mongo`)
- Secrets are loaded from `.env`
- Passwords are stored hashed (never plain text)
- Write operations require authentication
- Ownership checks prevent regular users from modifying others' data

## Role Logic
- First registered user gets role `admin`
- Next users get role `user`

## Manual Test Checklist
1. Register first user -> verify role is `admin`
2. Register second user -> verify role is `user`
3. Login as user, create workout, verify CRUD on own data
4. Login as different user, verify no access to other user data
5. Login as admin, verify access to admin summary
6. Check pagination/filter/sort on workout list

## HTTP Status Codes
- `200` success
- `201` created
- `400` validation/input error
- `401` unauthorized
- `403` forbidden
- `404` not found
- `500` server error

## Notes
- This repository currently includes `sqlite3` in dependencies, but the application uses MongoDB.
- Ensure MongoDB Atlas Network Access includes your current IP when testing remotely.
