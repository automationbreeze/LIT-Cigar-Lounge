# Hostinger Node.js Deployment Guide

This application is a full-stack Node.js app with an Express backend and a React frontend. To deploy it to Hostinger, follow these steps:

## 1. Prerequisites
*   A Hostinger **Node.js Hosting** plan or a **VPS**.
*   Node.js installed on the server (v18 or higher recommended).

## 2. Preparation
1.  **Export the Code**: Use the "Export" or "GitHub" sync feature in AI Studio to get the latest source code.
2.  **Build the Frontend**: On your local machine or the server, run:
    ```bash
    npm install
    npm run build
    ```
    This will create a `dist` folder containing the compiled frontend.

## 3. Uploading to Hostinger
1.  Upload all files (including the `dist` folder, `server.ts`, and `package.json`) to your server's public directory (e.g., `public_html` or the path specified in your Node.js app settings).
2.  **Do NOT** upload `node_modules`.

## 4. Environment Variables
In your Hostinger Node.js Dashboard, add the following environment variables:
*   `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
*   `CLOUDINARY_API_KEY`: Your Cloudinary API key
*   `CLOUDINARY_API_SECRET`: Your Cloudinary API secret
*   `ADMIN_EMAIL`: Your desired admin email
*   `ADMIN_PASSWORD`: Your desired admin password
*   `JWT_SECRET`: A long, random string for session security
*   `NODE_ENV`: `production`

## 5. Starting the App
1.  In the Hostinger Node.js panel, set the **Application Entry Point** to `server.ts`.
2.  Set the **Run Command** to `npm start`.
3.  Click **"Install Dependencies"** (if available) or run `npm install` via SSH.
4.  Click **"Start"** or **"Restart"**.

## Troubleshooting
*   **404 Errors**: Ensure the `dist` folder was uploaded and contains `index.html`.
*   **Login Fails**: Check that `ADMIN_EMAIL` and `ADMIN_PASSWORD` match what you are typing.
*   **Gallery Empty**: Check that your Cloudinary credentials are correct in the environment variables.
