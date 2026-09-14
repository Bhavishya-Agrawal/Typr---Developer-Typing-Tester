# Typr_ · Full-Stack Developer Typing Platform (MERN)

<div align="center">
  <h3>A modern, minimalist full-stack typing lab for developers.</h3>
  <p>Practice with genuine, production-grade code snippets across Python, JavaScript, Java, and C++. Measure typing telemetry in real-time, benchmark against global leaderboards, and monitor performance progression.</p>

  <img src="https://img.shields.io/badge/Stack-MERN-green?style=flat-square" alt="MERN Stack">
  <img src="https://img.shields.io/badge/React-18.3-blue?style=flat-square" alt="React">
  <img src="https://img.shields.io/badge/Node.js-Express-lightgrey?style=flat-square" alt="Express">
  <img src="https://img.shields.io/badge/Database-MongoDB%20%26%20MySQL-emerald?style=flat-square" alt="Database">
  <img src="https://img.shields.io/badge/Auth-JWT%20%2B%20Bcrypt-orange?style=flat-square" alt="Auth">
  <img src="https://img.shields.io/badge/License-MIT-purple?style=flat-square" alt="MIT License">
</div>

---

## 📌 Executive Summary

**Typr_** was engineered to solve a common developer problem: traditional typing tests rely on arbitrary English prose, failing to develop muscle memory for programming syntax (symbols, indentation, brackets, camelCase, and language keywords). 

Typr_ provides an interactive typing engine loaded with **250+ real-world code snippets** across **Python, JavaScript, Java, and C++**, paired with an **obsidian dark theme** and an **inverted high-contrast light theme**, full-stack REST API persistence, JWT authentication, user telemetry analytics, and global leaderboards.

---

## 🛠️ Architecture & Technology Stack

```
+-----------------------------------------------------------------------+
|                            CLIENT (React + Vite)                      |
|  - React 18 SPA (React Router DOM)                                   |
|  - Zero-dependency Vanilla CSS Design System (CSS Custom Properties)  |
|  - Dual Theme Engine (Dark & Light)                                   |
|  - State Management: React Context API (AuthContext, ThemeContext)    |
+-----------------------------------------------------------------------+
                                   |
                                   | REST API (JSON / Bearer JWT)
                                   v
+-----------------------------------------------------------------------+
|                         SERVER (Node.js + Express)                    |
|  - MVC Architecture (Controllers, Models, Routes, Middleware)         |
|  - Authentication: JSON Web Tokens (JWT) + Bcrypt.js (10 salt rounds) |
|  - CORS Security & Centralized Error Handler Middleware               |
+-----------------------------------------------------------------------+
                                   |
                                   | Mongoose ODM (or MySQL Relational)
                                   v
+-----------------------------------------------------------------------+
|                           DATABASE (MongoDB)                          |
|  - Users Collection (Credentials, Profiles)                          |
|  - Snippets Collection (250+ Code Snippets indexed by Lang & Bucket)  |
|  - Results Collection (Compound indexed on WPM, Accuracy, User)       |
+-----------------------------------------------------------------------+
```

### Stack Details
- **Frontend**: React 18, Vite 6, React Router DOM 6, Lucide Icons, Pure CSS3 (Custom Variables).
- **Backend**: Node.js, Express.js (RESTful API, MVC Pattern).
- **Database**: MongoDB with Mongoose ODM (Indexes on `{ wpm: -1, accuracy: -1 }`).
- **Authentication**: Stateless JSON Web Tokens (JWT) with secure password hashing (`bcryptjs`).
- **Dual DB Architecture Knowledge**: Includes full relational MySQL table schema mappings for technical interviews.

---

## ✨ Core Features

### 1. Dual Aesthetic Theme Engine
- **Obsidian Dark (Default)**: Deep obsidian backdrop (`#070709`) with subtle dot-matrix grid overlay, glowing telemetry pills, and high-contrast typography.
- **Inverted Light Mode**: High-contrast paper-white aesthetic (`#f8fafc`) with slate dark controls and subtle grey borders.
- **Persistent Toggle**: 1-click switcher in the navbar that remembers preference in `localStorage`.

### 2. High-Performance Typing Engine
- **Languages**: Python, JavaScript, Java, C++.
- **Practice Modes**:
  - **Snippet Mode**: Complete entire algorithmic snippets.
  - **Time Mode**: 15s, 30s, 60s sprints.
  - **Words Mode**: 30, 50, 100 word sprints.
- **Smart Indentation**: Automatically calculates leading whitespace, colons (`:`), and curly brackets (`{`) upon pressing `Enter`.
- **Zero-Latency Keystroke Validation**: Character-by-character validation with visual cursor feedback.
- **Calculated Metrics**:
  - $$\text{WPM} = \frac{\text{Correct Characters} / 5}{\text{Elapsed Time in Minutes}}$$
  - $$\text{Accuracy} = \left(\frac{\text{Correct Characters}}{\text{Total Keystrokes}}\right) \times 100$$

### 3. Full-Stack User Features
- **Guest Play**: Instant practice without registration friction.
- **User Authentication**: Secure Sign Up & Login with JWT session restoration.
- **Global Leaderboards**: Real-time rankings with language and mode filters.
- **User Analytics & History**: Personal best WPM, average speed, accuracy rates, and chronological session history.

---

## 🗄️ Database Design

### MongoDB (Mongoose Schemas)

#### User Schema
```javascript
{
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  createdAt: { type: Date, default: Date.now }
}
```

#### Result Schema
```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String, required: true, default: 'Anonymous' },
  wpm: { type: Number, required: true },
  rawWpm: { type: Number, default: 0 },
  accuracy: { type: Number, required: true },
  timeTaken: { type: Number, required: true },
  language: { type: String, enum: ['python', 'javascript', 'java', 'cpp'] },
  mode: { type: String, enum: ['snippet', 'time', 'words'] },
  modeDetail: { type: String, default: 'default' },
  keystrokes: {
    total: Number,
    correct: Number,
    incorrect: Number
  },
  createdAt: { type: Date, default: Date.now }
}
// Compound index for fast leaderboard ordering
resultSchema.index({ wpm: -1, accuracy: -1 });
```

#### Snippet Schema
```javascript
{
  language: { type: String, enum: ['python', 'javascript', 'java', 'cpp'] },
  bucket: { type: String, enum: ['words30', 'words50', 'words100'] },
  code: { type: String, required: true },
  wordCount: Number,
  charCount: Number
}
```

### Relational MySQL Equivalent (For Interview Explanations)
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    username VARCHAR(50) NOT NULL,
    wpm INT NOT NULL,
    accuracy INT NOT NULL,
    time_taken INT NOT NULL,
    language ENUM('python', 'javascript', 'java', 'cpp') NOT NULL,
    mode ENUM('snippet', 'time', 'words') NOT NULL,
    total_keystrokes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_leaderboard (wpm DESC, accuracy DESC)
);

CREATE TABLE snippets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    language ENUM('python', 'javascript', 'java', 'cpp') NOT NULL,
    bucket ENUM('words30', 'words50', 'words100') NOT NULL,
    code TEXT NOT NULL,
    word_count INT NOT NULL,
    char_count INT NOT NULL,
    INDEX idx_lang_bucket (language, bucket)
);
```

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user, returns JWT token |
| `POST` | `/api/auth/login` | Public | Login user with email & password |
| `GET` | `/api/auth/me` | Private | Retrieve logged-in user profile |
| `GET` | `/api/snippets/random` | Public | Get random code snippet by language/mode |
| `GET` | `/api/snippets/stats` | Public | Get language count breakdown |
| `POST` | `/api/results` | Optional Auth | Record a typing test session |
| `GET` | `/api/results/my-history`| Private | Get last 50 tests of the authenticated user |
| `GET` | `/api/results/my-stats` | Private | Get aggregate stats (best WPM, avg WPM, tests) |
| `GET` | `/api/leaderboard` | Public | Get ranked leaderboards with language/mode filter |
| `GET` | `/api/health` | Public | Health check endpoint |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) running locally on port 27017 (or MongoDB Atlas connection string)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Bhavishya-Agrawal/Typr.git
cd Typr

# Install root, server, and client dependencies
npm run install-all
```

### 2. Configure Environment Variables
Inside `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/typr_db
JWT_SECRET=typr_dev_secret_key_btech_cse_2026_portfolio
```

### 3. Seed the Database
Populate MongoDB with 250+ curated code snippets and benchmark demo typists:
```bash
npm run seed
```

### 4. Run Both Client & Server Locally
Start both Express backend and Vite frontend with a single command:
```bash
npm run dev
```

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:5000`

---

## ☁️ Deployment to Vercel

Typr_ is pre-configured with `vercel.json` to deploy both the React frontend and the Express backend as a unified full-stack project under a single Vercel URL.

See the complete step-by-step guide in [VERCEL_DEPLOYMENT_GUIDE.md](VERCEL_DEPLOYMENT_GUIDE.md):
1. Create a free **MongoDB Atlas** database cluster and copy connection string.
2. Seed cloud database: `npm run seed` with `MONGO_URI`.
3. Push to GitHub and import into Vercel.
4. Add `MONGO_URI`, `JWT_SECRET`, and `NODE_ENV` in Vercel project environment variables.

---

## 👨‍💻 Author

**Bhavishya Agrawal**  
- GitHub: [@Bhavishya-Agrawal](https://github.com/Bhavishya-Agrawal)  
- LinkedIn: [Bhavishya Agrawal](https://www.linkedin.com/in/bhavishya-agrawal-8530622bb)

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
