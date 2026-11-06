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


# 1. Run the C++ backend locally

The backend uses CMake FetchContent to download Crow during the first configure/build. An internet connection is needed for that first build.

## Windows (MSYS2 UCRT64)

Install MSYS2 from https://www.msys2.org/ and open **MSYS2 UCRT64**. Run:

```bash
pacman -Syu
```

If it asks you to close the terminal, close it, reopen **MSYS2 UCRT64**, then run:

```bash
pacman -S --needed mingw-w64-ucrt-x86_64-gcc mingw-w64-ucrt-x86_64-cmake mingw-w64-ucrt-x86_64-ninja git
```

In the same UCRT64 terminal, go to the backend folder. Example (adjust the path to where you extracted the ZIP):

```bash
cd /c/Users/YOUR_NAME/Downloads/restaurant-management-system/backend
cmake -S . -B build -G Ninja
cmake --build build
./build/restaurant_api.exe
```

If your generator or environment produces `restaurant_api` without `.exe`, run that executable instead.

Keep this terminal open. The backend listens on `http://localhost:18080`.

Test it in another terminal/browser:

- http://localhost:18080/api/health
- http://localhost:18080/api/menu

## macOS / Linux

Install a C++17 compiler, CMake, Git and Ninja (or use another CMake generator), then:

```bash
cd backend
cmake -S . -B build -G Ninja
cmake --build build
./build/restaurant_api
```

---

# 2. Run the Next.js frontend locally

Open a **second terminal**:

```bash
cd frontend
npm install
```

Create `frontend/.env.local` by copying `.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:18080
```

Then start Next.js:

```bash
npm run dev
```

Open http://localhost:3000.

**Both terminals must stay running:** one for the C++ backend and one for Next.js.

---

# 3. API contract

The frontend calls the C++ backend directly. The API base URL is `NEXT_PUBLIC_API_URL`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend is running |
| GET | `/api/menu` | Get all menu items |
| GET | `/api/menu?search=burger` | Search menu |
| GET | `/api/menu?category=Main%20Course` | Filter by category |
| POST | `/api/orders` | Submit an order and calculate the bill |
| GET | `/api/receipts/:id` | Retrieve an order receipt |

Example order body:

```json
{
  "customerName": "Ayesha",
  "items": [
    { "menuItemId": 1, "quantity": 2 },
    { "menuItemId": 4, "quantity": 1 }
  ]
}
```

The C++ backend calculates prices. Do not trust a total sent by the browser.

## Tax setting

The demo uses a 5% tax rate in `backend/src/main.cpp`. Change `TAX_RATE` there if your teacher wants a different rate (or set it to `0.0` if your demo should have no tax).

---

## Automated build checks

The repository includes `.github/workflows/ci.yml`. GitHub Actions will attempt to build the Next.js frontend and compile the C++ backend whenever code is pushed to `main` or a Pull Request targets `main`. The first run may take longer because Crow is downloaded during the backend build. Check the **Actions** tab on GitHub for results.

## Pull Request (PR) process

1. Open the repository on GitHub.
2. Click **Compare & pull request** for your branch.
3. Set the base branch to `main`.
4. Describe what changed and how you tested it.
5. Ask the team lead to review.
6. Merge only after the change is tested.

Before starting new work, update your local `main`:

```bash
git switch main
git pull origin main
```

Then update your feature branch:

```bash
git switch feature/menu-search
git merge main
```

If a merge conflict appears, don't panic. Open the conflicted file, choose the correct combined code, save it, then:

```bash
git add .
git commit -m "Resolve merge conflict"
git push
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



# 6. Suggested task split

| Member | Suggested responsibility |
|---|---|
| Team lead | Repository, project integration, Crow API, C++ architecture and testing |
| MERN teammate | Next.js layout, responsive UI, frontend API integration |
| Member 3 | Menu data, menu display, category/search functionality |
| Member 4 | Order flow, billing/receipt UI, test cases and documentation |

Everyone should contribute to and understand the C++ requirements. Rebalance tasks based on what each person wants to learn.

## Useful official documentation

- Next.js: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Crow: https://crowcpp.org/
- CMake: https://cmake.org/documentation/
- GitHub collaboration: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests
