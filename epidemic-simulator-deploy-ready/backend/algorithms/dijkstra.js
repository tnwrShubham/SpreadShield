/**
 * Dijkstra's Algorithm — Epidemic Spread Simulation
 *
 * Models disease spread as a shortest-path problem:
 *   - Edge weight = travel time between regions
 *   - dist[v] = earliest time disease reaches region v from origin
 *   - Blocked edges/regions are skipped (admin quarantine)
 *
 * Uses a Min-Heap (priority queue) for O((V + E) log V)
 */

class MinHeap {
  constructor() {
    this.heap = [];
  }

  push(item) {
    this.heap.push(item);
    this._bubbleUp(this.heap.length - 1);
  }

  pop() {
    const top = this.heap[0];
    const last = this.heap.pop();
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this._sinkDown(0);
    }
    return top;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  _bubbleUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].dist <= this.heap[i].dist) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  _sinkDown(i) {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      if (l < n && this.heap[l].dist < this.heap[smallest].dist) smallest = l;
      if (r < n && this.heap[r].dist < this.heap[smallest].dist) smallest = r;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

/**
 * Run Dijkstra from an origin region across the entire graph.
 *
 * @param {string}   originId - _id of the starting (infected) region
 * @param {Array}    regions  - all Region documents
 * @param {Array}    edges    - all Edge documents (bidirectional)
 * @returns {Array} spreadOrder — sorted list of { regionId, regionName, arrivalTime, step }
 */
function dijkstraSpread(originId, regions, edges) {
  // Build adjacency list (skip blocked edges and blocked regions)
  const adj = new Map();
  regions.forEach((r) => {
    if (!r.isBlocked) adj.set(r._id.toString(), []);
  });

  edges.forEach((edge) => {
    if (edge.isBlocked) return;
    const from = edge.from.toString();
    const to = edge.to.toString();
    if (!adj.has(from) || !adj.has(to)) return;

    // Undirected graph — add both directions
    adj.get(from).push({ node: to, weight: edge.weight });
    adj.get(to).push({ node: from, weight: edge.weight });
  });

  // Initialize distances
  const dist = new Map();
  adj.forEach((_, id) => dist.set(id, Infinity));
  dist.set(originId, 0);

  const pq = new MinHeap();
  pq.push({ node: originId, dist: 0 });

  const visited = new Set();

  while (!pq.isEmpty()) {
    const { node: u, dist: d } = pq.pop();
    if (visited.has(u)) continue;
    visited.add(u);

    const neighbors = adj.get(u) || [];
    for (const { node: v, weight } of neighbors) {
      const newDist = d + weight;
      if (newDist < dist.get(v)) {
        dist.set(v, newDist);
        pq.push({ node: v, dist: newDist });
      }
    }
  }

  // Build sorted spread order (excluding origin itself & unreachable)
  const regionMap = new Map(regions.map((r) => [r._id.toString(), r]));
  const spreadOrder = [];

  dist.forEach((arrivalTime, regionId) => {
    if (regionId === originId) return;
    if (arrivalTime === Infinity) return; // unreachable / isolated by DSU
    const region = regionMap.get(regionId);
    if (region) {
      spreadOrder.push({
        regionId,
        regionName: region.name,
        arrivalTime,
      });
    }
  });

  // Sort by arrival time ascending
  spreadOrder.sort((a, b) => a.arrivalTime - b.arrivalTime);

  // Add step index
  spreadOrder.forEach((item, idx) => {
    item.step = idx + 1;
  });

  return spreadOrder;
}

module.exports = { dijkstraSpread };
