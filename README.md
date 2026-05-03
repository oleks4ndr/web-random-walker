# Website Random Walker

A local web app for exploring website navigability.

Website Random Walker crawls a site, builds a directed graph of internal links, visualizes the graph, and runs random-walk simulations to estimate which pages are easy to reach, hidden, highly visited, or dead ends.

## Stack

- Backend: FastAPI, BeautifulSoup, requests, NetworkX, local JSON storage
- Frontend: React, TypeScript, Vite, React Flow

## Setup

Clone the repo, then install dependencies from the project root:

```bash
make setup
```

This creates `backend/.venv`, installs Python dependencies, and runs `npm install` for the frontend.

## Run Locally

Start the backend in one terminal:

```bash
make backend
```

Start the frontend in another terminal:

```bash
make frontend
```

Open the app at:

```text
http://127.0.0.1:5173
```

Backend API docs are available at:

```text
http://127.0.0.1:8000/docs
```

## Data

Scan results are saved locally as JSON under:

```text
data/scans/
```

Each scan stores metadata, graph data, metrics, and random-walk results.
