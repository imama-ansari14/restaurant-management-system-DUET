# Maison — Restaurant Management System

A beginner-friendly group project starter built with **Next.js + Tailwind CSS** (frontend) and **C++17 + Crow** (backend).

## Features included

- Display a restaurant menu with category filters and live search.
- Add/remove items and change quantities in a cart.
- Submit an order to the C++ backend.
- Calculate subtotal, tax and total on the C++ backend.
- Generate and print a receipt.
- Health-check endpoint for testing the backend.

> **Important project note:** this starter stores orders in memory. Orders disappear when the C++ server restarts. That is intentional for the first working milestone. Add file/database persistence only after the team has the core flow working.

## Folder structure

```text
restaurant-management-system/
├── frontend/             # Next.js + Tailwind CSS
├── backend/              # C++17 + Crow HTTP API
├── .github/              # GitHub Actions build checks + PR/issue templates
├── README.md
└── .gitignore
```


# 5. Deployment

## Frontend on Vercel

1. Push the repository to GitHub.
2. In Vercel, import the repository.
3. Set the **Root Directory** to `frontend`.
4. Add Environment Variable:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: your deployed C++ backend URL, e.g. `https://your-api.example.com`
5. Deploy.

The backend must be deployed separately and reachable over HTTPS. Vercel's standard Functions do not provide a native, straightforward deployment target for a long-running Crow C++ server. Vercel supports official function runtimes such as Node.js, Python, Ruby, Go and Rust, plus WebAssembly and community runtimes; this is not the same as hosting a normal Crow server process.

## C++ backend

The included `backend/Dockerfile` builds the C++ server as a container. You can deploy that container to a Docker-compatible host. Render's free web services currently do not require a credit card according to its current free-tier article, but availability and policies can change. Some other providers may require payment verification.

For a class demonstration with no backend hosting account, the simplest dependable fallback is:
- Deploy the frontend to Vercel.
- Run the C++ backend on a team member's laptop during the presentation.
- Connect the deployed frontend to the laptop only if the laptop is publicly reachable through a secure tunnel; otherwise present both locally.

Do not put a private/local address such as `http://localhost:18080` into the deployed Vercel environment variable. `localhost` on Vercel means Vercel's own machine, not your laptop.
