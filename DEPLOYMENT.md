# Deployment Guide

This guide provides step-by-step instructions for deploying the MERN stack Learning Management System. The backend API (Node.js/Express) will be hosted on **Render**, and the frontend (React/Vite) will be hosted on **Vercel**.

## Prerequisites

- A GitHub account with your project code pushed to a repository.
- A [Render](https://render.com/) account (free tier available).
- A [Vercel](https://vercel.com/) account (free tier available).
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account for the hosted database (free tier available).

---

## Step 1: Backend Deployment (Render)

### 1a. Set up MongoDB Atlas

1.  Create a new project and a new cluster on MongoDB Atlas.
2.  In the **Database Access** section, create a new database user. Save the username and password securely.
3.  In the **Network Access** section, add an IP address. For deployment, select **"Allow Access from Anywhere"** (0.0.0.0/0).
4.  Go to your cluster's **Overview**, click **Connect**, choose **Drivers**, and copy the **Connection String**. Replace `<username>` and `<password>` with your database user's credentials. This full string is your `MONGO_URI`.

### 1b. Deploy Express App on Render

1.  On the Render dashboard, click **New +** > **Web Service**.
2.  Connect your GitHub account and select your project repository.
3.  Configure the service:
    - **Name:** A unique name for your backend (e.g., `jupiter-lms-api`).
    - **Root Directory:** `backend` (if your Express app is in a `backend` subfolder; otherwise, leave it blank).
    - **Runtime:** `Node`.
    - **Build Command:** `npm install`.
    - **Start Command:** `npm start` (or the command that starts your server, e.g., `node server.js`).
4.  Click **Advanced**, then **Add Environment Variable**. Add the following secrets:
    - **Key:** `MONGO_URI`, **Value:** (Your MongoDB Atlas connection string from step 1a).
    - **Key:** `JWT_SECRET`, **Value:** (Create a long, random, and secret string for signing JWTs).
5.  Click **Create Web Service**. Render will build and deploy your backend. Once it's live, copy the URL provided by Render (e.g., `https://jupiter-lms-api.onrender.com`).

---

## Step 2: Frontend Deployment (Vercel)

### 2a. Prepare Your Frontend Code

Ensure your React application knows how to connect to the deployed backend. In your API service file (e.g., `services/api.ts`), the base URL should be configured to use an environment variable.

Example: `const API_URL = import.meta.env.VITE_API_BASE_URL;`

### 2b. Deploy React App on Vercel

1.  On the Vercel dashboard, click **Add New...** > **Project**.
2.  Connect your GitHub account and import your project repository.
3.  Vercel should automatically detect that you are using **Vite** and configure the build settings correctly.
    - If you are using a monorepo, you may need to specify the **Root Directory** as `frontend`.
4.  Expand the **Environment Variables** section and add the following:
    - **Key:** `VITE_API_BASE_URL`, **Value:** (The URL of your deployed Render backend, including the `/api` path, e.g., `https://jupiter-lms-api.onrender.com/api`).
5.  Click **Deploy**. Vercel will build and deploy your React application.

---

## Step 3: Final Configuration (CORS)

For security, your backend should only accept requests from your deployed frontend.

1.  Go back to your backend service on **Render**.
2.  Navigate to the **Environment** tab.
3.  Add a new environment variable to handle CORS:
    - **Key:** `CORS_ORIGIN`
    - **Value:** The URL of your deployed Vercel frontend (e.g., `https://your-project-name.vercel.app`).
4.  Make sure your Express server's CORS configuration uses this environment variable.
    ```javascript
    // Example in your server.js
    app.use(cors({
      origin: process.env.CORS_ORIGIN
    }));
    ```
5.  Save the environment variable in Render. This will trigger a new deployment with the updated setting.

Your Learning Management System is now fully deployed and live!