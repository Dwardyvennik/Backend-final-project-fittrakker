# Assignment 4 Report: Sessions & Security

## 1. Modified & Created Files

### Created Files
- `middleware/auth.js`: Middleware to protect routes by checking session existence.
- `routes/auth.js`: Handles Registration, Login, Logout, and Auth Status checks.
- `views/login.html`: Login page with AJAX form.
- `views/register.html`: Registration page with AJAX form.
- `seed.js`: Script to populate database with 20+ workouts.

### Modified Files
- `server.js`:
    - Configured `express-session` with `connect-mongo`.
    - Added `authRoutes`.
    - Served new HTML views.
- `routes/workouts.js`:
    - Applied `isAuthenticated` middleware to POST, PUT, DELETE.
    - Updated POST/PUT to handle `difficulty` and `notes`.
- `views/index.html`:
    - Added dynamic navigation (Show Login/Register or Workouts/Logout).
- `views/workouts.html`:
    - Added dynamic UI states (Hide Create/Delete if not logged in).
    - Added `difficulty` and `notes` inputs and display.
    - Integrated Logout logic.

---

## 2. Concepts Explanation

### How Sessions Work
1.  **Client sends credentials** (username/password) to `/api/auth/login`.
2.  **Server verifies** credentials against the database.
3.  **Server creates a session** object (storing `userId`, `username`) in the **MongoDB Session Store** (`sessions` collection).
4.  **Server sends a cookie** (`connect.sid`) containing the Session ID back to the client.
5.  **Subsequent requests** from the client include this cookie.
6.  **Express-session middleware** looks up the Session ID in the store. If found, it populates `req.session` with the user data, allowing the server to identify the user.

### How Cookies are Used
- The **Session ID** is the *only* thing stored in the browser cookie.
- No sensitive user data (password, email) is stored in the cookie.
- The cookie acts as a "key" to unlock the session data stored securely on the server (MongoDB).

### httpOnly and secure Flags
-   **`httpOnly: true`**:
    -   Prevents client-side JavaScript (`document.cookie`) from accessing the cookie.
    -   **Security Benefit:** Mitigates Cross-Site Scripting (XSS) attacks. If an attacker injects JS, they cannot read the session ID to hijack the session.
-   **`secure: true`**:
    -   Ensures the cookie is sent *only* over HTTPS connections.
    -   **Security Benefit:** Prevents the session ID from being intercepted over unencrypted HTTP (Man-in-the-Middle attacks).
    -   *Note: In this local dev setup, it's set to true only if NODE_ENV is 'production'.*

### Authentication vs Authorization
-   **Authentication (AuthN):** "Who are you?"
    -   Handled by `routes/auth.js` (Login/Register).
    -   Verifying username/password matches.
-   **Authorization (AuthZ):** "What are you allowed to do?"
    -   Handled by `middleware/auth.js` (`isAuthenticated`).
    -   Checking if a valid session exists before allowing write operations (POST, DELETE).
    -   *Example:* Anyone can read workouts (Public), but only authenticated users can create/delete them.

---

## 3. Bcrypt Hashing Implementation

Implemented in `routes/auth.js`:

**Hashing (Registration):**
```javascript
// routes/auth.js
const hashedPassword = await bcrypt.hash(password, 10);
await db.collection("users").insertOne({
  username,
  password: hashedPassword
});
```

**Verification (Login):**
```javascript
// routes/auth.js
const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) {
  return res.status(401).json({ error: "Invalid credentials" });
}
```

---

## 4. Blocking Unauthorized Users

Blocked at two levels:

1.  **Backend (API Level):**
    -   `middleware/auth.js` checks for `req.session.userId`.
    -   If missing, it returns `401 Unauthorized`.
    -   Applied to `POST`, `PUT`, `DELETE` in `routes/workouts.js`.
    ```javascript
    router.post("/", isAuthenticated, async (req, res) => ...
    ```

2.  **Frontend (UI Level):**
    -   `views/workouts.html` checks `/api/auth/status`.
    -   If not authenticated:
        -   Hides the "Create New Workout" form.
        -   Does not render "Delete" buttons.
        -   Shows a "Please Login" message.

---

## 5. Requirement Checklist

| Requirement | Implementation Details |
| :--- | :--- |
| **Project Structure Preserved** | No folders moved/renamed. |
| **Domain: Workouts (5-8 fields)** | Title, Type, Duration, Calories, Date, **Difficulty**, **Notes**. |
| **Data: 20+ Records** | `seed.js` created and executed. |
| **Auth: Sessions (express-session)** | Configured in `server.js` with `connect-mongo`. |
| **Auth: Bcrypt Passwords** | Used in `routes/auth.js`. |
| **Auth: Generic Errors** | Returns "Invalid credentials". |
| **Authorization: Protect Writes** |  `isAuthenticated` on POST/PUT/DELETE. |
| **Authorization: Public Read** | GET /api/workouts is open. |
| **Cookies: httpOnly** | Set in `server.js`. |
| **Web UI: Login/Register** | `views/login.html`, `views/register.html`. |
| **Web UI: CRUD** |`views/workouts.html` fully functional. |
| **Validation** | Backend checks for required fields. |
| **Deployment Safety** | Uses `process.env`, `secure` cookie flag logic. |
| **Final Output Report** | This file (`ASSIGNMENT_4_REPORT.md`). |

---

