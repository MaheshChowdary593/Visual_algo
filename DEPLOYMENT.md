# Deploying visual_fast

Follow these "pin to pin" steps to deploy your project.

## Step 1: Backend Deployment (Render)

1.  **Push your code to GitHub**: If you haven't already, create a repository on GitHub and push the current codebase.
2.  **Go to [Render.com](https://render.com/)**: Log in with your GitHub account.
3.  **New Web Service**:
    - Click **New** -> **Web Service**.
    - Choose **Build and deploy from a Git repository**.
    - Connect your project repository.
4.  **Service Settings**:
    - **Name**: `visual-algo-backend`
    - **Language**: `Node`
    - **Root Directory**: `server`
    - **Build Command**: `npm install`
    - **Start Command**: `npm start`
5.  **Environment Variables**:
    - Click **Advanced** or **Environment**.
    - Add `MISTRAL_API_KEY` with your actual key.
6.  **Deploy**: Click **Create Web Service**. Wait for it to deploy successfully.
7.  **Copy the URL**: You will get a link like `https://visual-algo-backend.onrender.com`. Save this!

## Step 2: Frontend Deployment (Vercel)

1.  **Go to [Vercel.com](https://vercel.com/)**: Log in with GitHub.
2.  **Add New Project**:
    - Click **Add New** -> **Project**.
    - Import your project repository.
3.  **Project Settings**:
    - **Framework Preset**: `Vite` (should be auto-detected).
    - **Root Directory**: `client`
4.  **Environment Variables**:
    - Add a new variable:
        - **Key**: `VITE_API_URL`
        - **Value**: The Render URL you copied in Step 1 (e.g., `https://visual-algo-backend.onrender.com`).
5.  **Deploy**: Click **Deploy**. Vercel will generate your live website link!

---

### Important Maintenance Note
If you update your code and push it to GitHub, both Render and Vercel will automatically redeploy the new version.
