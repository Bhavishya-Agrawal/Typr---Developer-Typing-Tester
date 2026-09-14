# Typr_ · Technical Interview Preparation Guide
### Prepared for 4th-Year B.Tech CSE Placement & Technical Rounds

This guide provides articulate, confident answers to common questions an interviewer might ask about **Typr_**, its architecture, database design, algorithms, and security.

---

### Q1: Can you give a 60-second elevator pitch of your project?
**Answer:**
> *"Typr_ is a full-stack developer typing platform built using the MERN stack (MongoDB, Express.js, React, Node.js). Unlike traditional typing test platforms that only test English prose, Typr_ tests real code snippets across Python, JavaScript, Java, and C++, helping developers build genuine muscle memory for programming syntax and indentation. 
>
> On the frontend, it uses React with a custom zero-dependency CSS design system supporting high-contrast obsidian dark and light themes. On the backend, an Express REST API handles stateless JWT authentication, records keystroke telemetry, and queries MongoDB for real-time leaderboards and personal performance metrics."*

---

### Q2: How did you design the backend architecture?
**Answer:**
> *"I implemented the classic **MVC (Model-View-Controller)** pattern:
> - **Models**: Define Mongoose schemas for `User`, `Result`, and `Snippet` with data validation, password hashing hooks, and database indexing.
> - **Controllers**: Encapsulate the core business logic—such as user registration, login, statistical aggregations, and leaderboard queries.
> - **Routes**: Modular Express routers (`/api/auth`, `/api/results`, `/api/snippets`, `/api/leaderboard`) that map HTTP verbs to controller actions.
> - **Middleware**: Custom middleware for JSON Web Token (JWT) verification (`protect` and `optionalAuth`) and centralized error handling."*

---

### Q3: How do you calculate Words Per Minute (WPM) and Accuracy?
**Answer:**
> *"In standard typing metrics, one 'word' is standardized to **5 keystrokes** (to account for words of varying lengths).
>
> 1. **Net WPM**:
>    $$\text{WPM} = \frac{\text{Correct Keystrokes} / 5}{\text{Elapsed Time in Minutes}}$$
> 2. **Accuracy Percentage**:
>    $$\text{Accuracy} = \left(\frac{\text{Correct Keystrokes}}{\text{Total Keystrokes Attempted}}\right) \times 100$$
>
> During an active test, these metrics are updated every 100 milliseconds via an active interval and keystroke listener in React, ensuring real-time telemetry."*

---

### Q4: How does Authentication work, and why did you choose JWT over Sessions?
**Answer:**
> *"I chose **JSON Web Tokens (JWT)** because they are stateless, scalable, and ideal for single-page applications (SPAs):
> 1. When a user registers or logs in, their password is verified using `bcryptjs` with 10 salt rounds.
> 2. The server signs a JWT containing the user's ID using a secret key and returns it in the response payload.
> 3. The client stores the token in `localStorage` and attaches it to the `Authorization: Bearer <token>` header for protected API requests.
> 4. An Express middleware decodes the token, validates its cryptographic signature, looks up the user, and attaches `req.user` to the request object.
>
> Unlike session-based authentication which requires the server to maintain session state in memory or Redis, JWTs allow the backend to remain completely stateless."*

---

### Q5: What database indexes did you create, and why?
**Answer:**
> *"In MongoDB, I created a **compound index on `{ wpm: -1, accuracy: -1 }`** on the `Result` collection. 
>
> When the leaderboard is queried, the query sorts results by `wpm` descending and `accuracy` descending. Without an index, MongoDB would perform a collection scan (COLLSCAN) and sort the results in memory (SORT stage). With the compound index, MongoDB performs an index scan (IXSCAN) which runs in $O(\log N + K)$ time, ensuring instant leaderboard loads even with thousands of records."*

---

### Q6: You know both MongoDB and MySQL. How does your schema translate to MySQL?
**Answer:**
> *"In MongoDB, we take advantage of document flexibility for nested objects like `keystrokes: { total, correct, incorrect }`. 
>
> In **MySQL**, we would structure this into a normalized relational model:
> 1. `users` table: `id (PK)`, `username (UNIQUE)`, `email (UNIQUE)`, `password_hash`, `created_at`.
> 2. `results` table: `id (PK)`, `user_id (FK -> users.id)`, `wpm`, `accuracy`, `time_taken`, `language`, `mode`, with a foreign key constraint and a compound index `CREATE INDEX idx_leaderboard ON results (wpm DESC, accuracy DESC)`.
> 3. `snippets` table: `id (PK)`, `language`, `bucket`, `code (TEXT)`, `word_count`, `char_count`.
>
> MongoDB allows rapid iteration and direct JSON integration with Node.js, while MySQL offers strict ACID compliance, foreign key referential integrity, and efficient joins."*

---

### Q7: How did you implement the Dark and Light themes?
**Answer:**
> *"I implemented a zero-dependency theme engine using CSS Custom Properties (CSS Variables) and React Context:
> 1. In `index.css`, I defined token sets for `:root[data-theme='dark']` and `:root[data-theme='light']`.
> 2. The dark theme features an obsidian backdrop (`#070709`) with a subtle dot-matrix grid and glowing telemetry badges, while the light theme is a high-contrast inverted paper-white layout (`#f8fafc`).
> 3. A `ThemeContext` maintains the state, applies `data-theme` to the root `<html>` element, and synchronizes the user's preference to `localStorage`."*

---

### Q8: How did you handle keyboard events and indentation in React?
**Answer:**
> *"Typing tests have strict latency requirements. I attached a global `keydown` event listener in `useEffect`:
> - Regular letters advance the cursor index and compare `typedChar === expectedChar`.
> - `Backspace` slices the input string and decrements the index.
> - For programming syntax, pressing `Enter` inspects the current line for indentation; if the previous line ended with a colon (`:`) or curly brace (`{`), it automatically prepends four spaces of indentation to simulate a real IDE.
> - When the user unfocuses, a soft overlay appears prompting them to click or press any key to resume."*

---

### Q9: How does the application deploy to Vercel as a full-stack project?
**Answer:**
> *"We utilize Vercel's unified deployment architecture via `vercel.json`:
> - The React frontend is built into static assets served via Vercel's global Edge CDN.
> - The Express backend is exposed as a Vercel Serverless Function via `api/index.js`.
> - Rewrites forward `/api/*` to the serverless function and all other routes `/(.*)` to the React SPA (`index.html`).
> - This eliminates CORS issues completely since the frontend and API share the exact same domain."*
