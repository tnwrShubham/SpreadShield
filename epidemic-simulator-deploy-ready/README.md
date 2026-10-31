# Epidemic Spread Simulator — MERN + DSA

A full-stack MERN application that simulates epidemic spread across regions using core DSA algorithms.

## Algorithms Used

### DSU — Disjoint Set Union (Union-Find)
- Tracks which regions are connected in the same network
- Detects when quarantines split the network into isolated components
- O(α(n)) per operation — practically constant time
- Used in: `backend/algorithms/dsu.js`

### Dijkstra's Algorithm
- Finds the shortest (fastest) path disease will take from origin
- Edge weight = travel time between regions in hours
- Blocked edges/regions are skipped — models quarantine effect
- Uses a Min-Heap (Priority Queue) for O((V + E) log V)
- Used in: `backend/algorithms/dijkstra.js`

## Project Structure

```
epidemic-simulator/
├── backend/
│   ├── algorithms/
│   │   ├── dsu.js          ← DSU implementation
│   │   └── dijkstra.js     ← Dijkstra + MinHeap
│   ├── controllers/
│   │   ├── regionController.js
│   │   ├── edgeController.js
│   │   └── simulationController.js  ← core logic
│   ├── models/
│   │   ├── Region.js
│   │   ├── Edge.js
│   │   └── Simulation.js
│   ├── routes/
│   │   ├── regionRoutes.js
│   │   ├── edgeRoutes.js
│   │   └── simulationRoutes.js
│   ├── server.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── algorithms/        ← (optional) client-side algo demos
    │   ├── components/
    │   │   ├── GraphCanvas.jsx     ← HTML5 Canvas graph renderer
    │   │   ├── SpreadTimeline.jsx  ← Dijkstra step-by-step
    │   │   ├── DSUComponents.jsx   ← Connected components UI
    │   │   └── ControlPanel.jsx    ← Admin block/unblock
    │   ├── hooks/
    │   │   └── useSocket.js        ← Socket.io real-time updates
    │   ├── pages/
    │   │   └── SimulatorPage.jsx   ← Main page
    │   ├── utils/
    │   │   └── api.js              ← Axios API calls
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## Setup & Run

### Prerequisites
- Node.js v18+
- MongoDB running locally (`mongod`)

### Backend
```bash
cd backend
npm install
# Make sure MongoDB is running
npm run dev
# Server starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App opens on http://localhost:5173
```

## How to Use

1. Click **"Seed Demo Data"** — loads 8 Indian cities + 11 routes
2. Select an **origin region** from the dropdown (e.g., Delhi)
3. Click **"Run Simulation"**
   - Dijkstra computes the spread order by travel time
   - DSU shows which components are connected
4. Use the **timeline slider** to replay spread step by step
5. Go to **Admin tab** → quarantine a region or close a route
6. Run simulation again — see how quarantine isolates the spread
7. Use **DSU tab** to see which regions are now in separate components
8. Use **Check tab** to test if two specific cities can still reach each other

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/regions | Get all regions |
| POST | /api/regions/seed | Seed demo regions |
| PATCH | /api/regions/:id/toggle-block | Quarantine/unblock a region |
| GET | /api/edges | Get all edges |
| POST | /api/edges/seed | Seed demo edges |
| PATCH | /api/edges/:id/toggle-block | Close/reopen a route |
| POST | /api/simulation/run | Run DSU + Dijkstra simulation |
| POST | /api/simulation/check-connection | DSU connectivity check |
| GET | /api/simulation/components | Get current DSU components |
| GET | /api/simulation/history | Past simulations |

## Resume Points

- Implemented **Dijkstra's algorithm** with a custom **Min-Heap** (priority queue) for O((V+E) log V) epidemic spread simulation
- Built **Disjoint Set Union** with path compression and union by rank to detect network splits during quarantine
- Real-time graph updates via **Socket.io** — all clients see quarantine changes instantly
- Admin can block regions/routes; DSU detects and displays the resulting **connected components**
