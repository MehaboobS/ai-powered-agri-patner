# 🚀 Deploying Bharath Krishi on Render (1-Click Blueprint)

[Render](https://render.com) is the simplest, most automated platform to deploy this full-stack application. With the included [`render.yaml`](render.yaml) Blueprint, Render automatically provisions and links:
1. **Managed PostgreSQL Database** (`agri`)
2. **FastAPI Backend Web Service** (Docker container with Prisma migrations)
3. **React + Vite Frontend Static Site** (Fast Global CDN with free HTTPS)

---

## ⚡ 1-Click Blueprint Deployment (Under 3 Minutes)

### Step 1: Open Render Dashboard
1. Go to **[dashboard.render.com](https://dashboard.render.com/)**.
2. Sign in with your **GitHub account** (`MehaboobS`).

---

### Step 2: Create New Blueprint
1. In the top right corner of the Render dashboard, click the **New +** button.
2. Select **Blueprint** (or go to [dashboard.render.com/blueprints](https://dashboard.render.com/blueprints)).
3. Connect your GitHub repository:
   - Search for **`ai-powered-agri-patner`** (or select `MehaboobS/ai-powered-agri-patner`).
   - Click **Connect**.

---

### Step 3: Review and Deploy
1. Render will automatically parse [`render.yaml`](render.yaml) and display the 3 services it will create:
   - 🐘 **`bharath-agri-db`** (PostgreSQL Database)
   - 🐍 **`bharath-agri-backend`** (Web Service from Dockerfile)
   - ⚛️ **`bharath-agri-frontend`** (Static Site)
2. In the Blueprint name field, you can keep the default or enter `bharath-krishi`.
3. Under **Environment Variables**:
   - `GEMINI_API_KEY`: *(Optional)* Paste your Google Gemini API key if you want live AI leaf diagnostics enabled.
4. Click **Apply**.

---

### Step 4: Watch it Build & Go Live!
Render will now automatically:
- Spin up the PostgreSQL database.
- Build the backend Docker image, run `prisma db push` to create all tables (Farmers, GovSchemes, SavedPlans), seed the admin account (`Mehaboob` / `Mehaboob@123`) and 8 welfare schemes.
- Build the React Vite frontend and distribute it globally on Render's CDN.

Once finished, click on the **`bharath-agri-frontend`** link (e.g. `https://bharath-agri-frontend.onrender.com`) to open your live application!

---

## 🛠️ Alternative: Manual Setup on Render (Step-by-Step)

If you prefer configuring each service manually instead of using Blueprint:

### 1. Create PostgreSQL Database
1. Click **New +** $\rightarrow$ **PostgreSQL**.
2. Name: `bharath-agri-db`, Database: `agri`, User: `postgres`, Plan: `Free`.
3. Click **Create Database**.
4. Once created, copy the **Internal Database URL**.

### 2. Create Backend Web Service
1. Click **New +** $\rightarrow$ **Web Service**.
2. Connect repo `ai-powered-agri-patner`.
3. Environment: **Docker** (Docker Command: keep default).
4. Dockerfile path: `./backend/Dockerfile`, Docker Context: `./backend`.
5. Under **Environment Variables**, add:
   - `DATABASE_URL`: *(Paste the Internal Database URL from Step 1)*
   - `ALLOWED_ORIGINS`: `*`
   - `GEMINI_API_KEY`: *(Optional)*
6. Click **Create Web Service**. Note your backend URL: e.g. `https://bharath-agri-backend.onrender.com`.

### 3. Create Frontend Static Site
1. Click **New +** $\rightarrow$ **Static Site**.
2. Connect repo `ai-powered-agri-patner`.
3. Root Directory: `frontend`.
4. Build Command: `npm install && npm run build`.
5. Publish Directory: `dist`.
6. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://bharath-agri-backend.onrender.com` *(Replace with your backend URL from Step 2)*.
7. Under **Redirects/Rewrites**:
   - Source: `/*` $\rightarrow$ Destination: `/index.html` $\rightarrow$ Action: `Rewrite`.
8. Click **Create Static Site**.
