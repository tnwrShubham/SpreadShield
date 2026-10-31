import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const getRegions = () => api.get("/regions");
export const createRegion = (data) => api.post("/regions", data);
export const seedRegions = () => api.post("/regions/seed");
export const toggleRegionBlock = (id) => api.patch(`/regions/${id}/toggle-block`);
export const deleteRegion = (id) => api.delete(`/regions/${id}`);

export const getEdges = () => api.get("/edges");
export const createEdge = (data) => api.post("/edges", data);
export const seedEdges = () => api.post("/edges/seed");
export const toggleEdgeBlock = (id) => api.patch(`/edges/${id}/toggle-block`);
export const deleteEdge = (id) => api.delete(`/edges/${id}`);

export const runSimulation = (originRegionId) =>
  api.post("/simulation/run", { originRegionId });
export const checkConnection = (regionA, regionB) =>
  api.post("/simulation/check-connection", { regionA, regionB });
export const getComponents = () => api.get("/simulation/components");
export const getHistory = () => api.get("/simulation/history");
