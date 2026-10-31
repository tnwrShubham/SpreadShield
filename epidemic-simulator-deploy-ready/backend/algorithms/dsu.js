/**
 * DSU — Disjoint Set Union (Union-Find)
 *
 * Used to:
 *  1. Check if two regions are connected (reachable from each other)
 *  2. Find all connected components in the region graph
 *  3. Detect network splits when edges/regions are blocked
 */

class DSU {
  constructor(n) {
    // parent[i] = parent of node i; initially each node is its own parent
    this.parent = Array.from({ length: n }, (_, i) => i);
    // rank[i] = tree height approximation (for union by rank)
    this.rank = new Array(n).fill(0);
  }

  // Path compression: flatten tree while finding root
  find(x) {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // path compression
    }
    return this.parent[x];
  }

  // Union by rank: attach smaller tree under larger
  union(x, y) {
    const px = this.find(x);
    const py = this.find(y);
    if (px === py) return false; // already in same set

    if (this.rank[px] < this.rank[py]) {
      this.parent[px] = py;
    } else if (this.rank[px] > this.rank[py]) {
      this.parent[py] = px;
    } else {
      this.parent[py] = px;
      this.rank[px]++;
    }
    return true;
  }

  // Are x and y in the same connected component?
  connected(x, y) {
    return this.find(x) === this.find(y);
  }

  // Get all connected components as groups of indices
  getComponents(n) {
    const map = new Map();
    for (let i = 0; i < n; i++) {
      const root = this.find(i);
      if (!map.has(root)) map.set(root, []);
      map.get(root).push(i);
    }
    return [...map.values()];
  }
}

/**
 * Build DSU from regions and edges
 * Skips blocked regions and blocked edges
 *
 * @param {Array} regions - array of Region documents
 * @param {Array} edges   - array of Edge documents
 * @returns {{ dsu: DSU, idToIndex: Map, indexToId: Map, components: Array }}
 */
function buildDSU(regions, edges) {
  const idToIndex = new Map();
  const indexToId = new Map();

  // Only include non-blocked regions
  const activeRegions = regions.filter((r) => !r.isBlocked);
  activeRegions.forEach((r, i) => {
    idToIndex.set(r._id.toString(), i);
    indexToId.set(i, r._id.toString());
  });

  const dsu = new DSU(activeRegions.length);

  // Union connected (non-blocked) edges
  edges.forEach((edge) => {
    if (edge.isBlocked) return;
    const fromId = edge.from.toString();
    const toId = edge.to.toString();
    if (!idToIndex.has(fromId) || !idToIndex.has(toId)) return;
    dsu.union(idToIndex.get(fromId), idToIndex.get(toId));
  });

  const rawComponents = dsu.getComponents(activeRegions.length);
  // Map indices back to region IDs
  const components = rawComponents.map((group) =>
    group.map((i) => indexToId.get(i))
  );

  return { dsu, idToIndex, indexToId, components };
}

/**
 * Check if two regions are connected (considering blocks)
 */
function areConnected(regionIdA, regionIdB, regions, edges) {
  const { dsu, idToIndex } = buildDSU(regions, edges);
  const iA = idToIndex.get(regionIdA);
  const iB = idToIndex.get(regionIdB);
  if (iA === undefined || iB === undefined) return false;
  return dsu.connected(iA, iB);
}

module.exports = { DSU, buildDSU, areConnected };
