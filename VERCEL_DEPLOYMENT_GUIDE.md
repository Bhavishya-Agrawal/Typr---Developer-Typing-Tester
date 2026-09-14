# Vercel Deployment Guide · Typr_ MERN Stack

This guide explains how to deploy **Typr_** as a unified full-stack project on **Vercel** with a free **MongoDB Atlas** cloud database.

---

## 🏗️ How Typr_ Runs on Vercel

```
                                 https://typr-codetype.vercel.app
                                              │
                    ┌─────────────────────────┴─────────────────────────┐
                    ▼                                                   ▼
            Static Frontend                                    Serverless API
              (React + Vite)                                 (Express + Node.js)
              Route: /(.*)                                     Route: /api/(.*)
                    │                                                   │
             client/dist/                                          api/index.js
                                                                        │
                                                                        ▼
                                                                MongoDB Atlas Cloud
```

- **Frontend**: React SPA is compiled by Vite and served through Vercel's global Edge CDN.
- **Backend**: Express REST API runs as a Vercel Serverless Function via [`api/index.js`](file:///c:/Users/BHAVISHYA/Desktop/Typr%20-%20Developer%20Typing%20Test/api/index.js).
- **Zero CORS Issues**: Because both the frontend and API share the exact same domain, all `/api/*` calls work without cross-origin complications.

---

## Step 1: Set Up Free MongoDB Atlas Database (3 minutes)

Because local MongoDB (`127.0.0.1:27017`) cannot be reached by Vercel serverless functions on the internet, you need a free cloud database:

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in (or create a free account).
2. Create a new cluster and select the **M0 Free Tier**.
3. Under **Security** -> **Database Access**:
   - Click **Add New Database User**.
   - Set an authentication username (e.g., `typr_admin`) and a secure password.
   - Role: **Read and write to any database**.
4. Under **Security** -> **Network Access**:
   - Click **Add IP Address**.
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`) and confirm. *(This allows Vercel's dynamic serverless IP pool to connect).*
5. Under **Deployment** -> **Database**:
   - Click **Connect** on your cluster.
   - Choose **Drivers** (Node.js).
   - Copy your connection string:
     ```
     mongodb+srv://typr_admin:<password>@cluster0.xxxxx.mongodb.net/typr_db?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual database user password.

---

## Step 2: Seed the Cloud Database with Code Snippets

Before deploying, populate your new MongoDB Atlas cluster with the 258 curated code snippets:

### On Windows (PowerShell):
```powershell
$env:MONGO_URI="mongodb+srv://typr_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/typr_db?retryWrites=true&w=majority"
npm run seed
```

### On Mac / Linux / Git Bash:
```bash
MONGO_URI="mongodb+srv://typr_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/typr_db?retryWrites=true&w=majority" npm run seed
```

You will see:
```
Connecting to MongoDB at mongodb+srv://...
Parsed 258 code snippets.
Successfully seeded 258 snippets into MongoDB!
Seeded benchmark leaderboard results!
Seeding completed successfully!
```

---

## Step 3: Deploy to Vercel

### Option A: Via GitHub (Recommended for Resume Projects)

1. Push your project to GitHub:
   ```bash
   git add .
   git commit -m "Convert to MERN stack with dual theme & Vercel deployment configuration"
   git push origin main
   ```
2. Go to [Vercel Dashboard](https://vercel.com/dashboard).
3. Click **Add New...** -> **Project**.
4. Select your **Typr** GitHub repository.
5. In the Vercel Project Setup:
   - **Framework Preset**: Other (or Vite)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (configured automatically via `vercel.json`)
   - **Output Directory**: `client/dist` (configured automatically via `vercel.json`)
6. Expand **Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `MONGO_URI` | `mongodb+srv://typr_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/typr_db?retryWrites=true&w=majority` |
   | `JWT_SECRET` | Any secure random string (e.g. `typr_jwt_prod_secret_2026`) |
   | `NODE_ENV` | `production` |
7. Click **Deploy**.

---

### Option B: Via Vercel CLI

If you prefer deploying directly from your terminal:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Run deployment:
   ```bash
   vercel
   ```
3. Follow the prompts:
   - Set up and deploy? **Yes**
   - Which scope? **Select your account**
   - Link to existing project? **Yes** (or No if first time)
4. Add environment variables:
   ```bash
   vercel env add MONGO_URI
   vercel env add JWT_SECRET
   vercel env add NODE_ENV
   ```
5. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## 🔍 Verification After Deployment

Once deployment finishes:
1. Visit `https://your-project.vercel.app/api/health` -> Verify you receive `{ status: "online", environment: "production" }`.
2. Visit `https://your-project.vercel.app/` -> Verify the Dark theme hero, interactive typing workstation, and snippets load.
3. Test signing up a new account, taking a typing test, and verifying your score records onto the live leaderboard.
