import { useState, useEffect, useCallback } from "react";
import GraphCanvas from "../components/GraphCanvas";
import SpreadTimeline from "../components/SpreadTimeline";
import DSUComponents from "../components/DSUComponents";
import ControlPanel from "../components/ControlPanel";
import {
  getRegions, getEdges, seedRegions, seedEdges,
  runSimulation, getComponents, checkConnection,
} from "../utils/api";
import { useSocket } from "../hooks/useSocket";

export default function SimulatorPage() {
  const [regions, setRegions]           = useState([]);
  const [edges, setEdges]               = useState([]);
  const [originId, setOriginId]         = useState("");
  const [spreadOrder, setSpreadOrder]   = useState([]);
  const [components, setComponents]     = useState([]);
  const [currentStep, setCurrentStep]   = useState(0);
  const [simResult, setSimResult]       = useState(null);
  const [loading, setLoading]           = useState(false);
  const [connCheck, setConnCheck]       = useState(null);
  const [checkA, setCheckA]             = useState("");
  const [checkB, setCheckB]             = useState("");
  const [activeTab, setActiveTab]       = useState("control"); // control | dsu | history

  const fetchAll = useCallback(async () => {
    const [rRes, eRes, cRes] = await Promise.all([
      getRegions(), getEdges(), getComponents(),
    ]);
    setRegions(rRes.data);
    setEdges(eRes.data);
    setComponents(cRes.data.components);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Real-time socket updates
  useSocket((event, data) => {
    if (event === "graph-updated") fetchAll();
    if (event === "simulation-result") {
      setSpreadOrder(data.spreadOrder);
      setComponents(
        data.connectedComponents.map((group, i) => ({
          componentIndex: i,
          regions: group.map((name) => ({ name })),
        }))
      );
    }
  });

  const handleSeed = async () => {
    setLoading(true);
    await seedRegions();
    await seedEdges();
    await fetchAll();
    setLoading(false);
  };

  const handleRunSimulation = async () => {
    if (!originId) return alert("Select an origin region first");
    setLoading(true);
    try {
      const res = await runSimulation(originId);
      setSpreadOrder(res.data.spreadOrder);
      setCurrentStep(0);
      setSimResult(res.data);
    } catch (err) {
      alert(err.response?.data?.error || "Simulation failed");
    }
    setLoading(false);
  };

  const handleCheckConnection = async () => {
    if (!checkA || !checkB) return;
    const res = await checkConnection(checkA, checkB);
    setConnCheck(res.data);
  };

  const tabStyle = (tab) => ({
    padding: "6px 14px",
    fontSize: 13,
    borderRadius: 6,
    border: "0.5px solid",
    borderColor: activeTab === tab ? "#534AB7" : "#D3D1C7",
    background: activeTab === tab ? "#EEEDFE" : "transparent",
    color: activeTab === tab ? "#3C3489" : "#5F5E5A",
    cursor: "pointer",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#F9F8F4", fontFamily: "sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "0.5px solid #D3D1C7", padding: "14px 24px", display: "flex", alignItems: "center", gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: "#2C2C2A" }}>
            Epidemic Spread Simulator
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: "#888780" }}>
            DSU (Union-Find) + Dijkstra's Algorithm — MERN Stack
          </p>
        </div>
        <button
          onClick={handleSeed}
          disabled={loading}
          style={{ marginLeft: "auto", padding: "8px 16px", borderRadius: 8, border: "0.5px solid #D3D1C7", background: "#fff", fontSize: 13, cursor: "pointer", color: "#2C2C2A" }}
        >
          {loading ? "Loading..." : "Seed Demo Data"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16, padding: 16, maxWidth: 1200, margin: "0 auto" }}>

        {/* LEFT — graph + simulation controls */}
        <div>
          {/* Origin selector + Run */}
          <div style={{ background: "#fff", border: "0.5px solid #D3D1C7", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: "0.5px solid #D3D1C7", fontSize: 13, background: "#fff", color: "#2C2C2A" }}
              >
                <option value="">Select origin (infected) region...</option>
                {regions.filter((r) => !r.isBlocked).map((r) => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
              <button
                onClick={handleRunSimulation}
                disabled={loading || !originId}
                style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: originId ? "#E24B4A" : "#D3D1C7", color: "#fff", fontSize: 13, fontWeight: 500, cursor: originId ? "pointer" : "default" }}
              >
                Run Simulation
              </button>
            </div>

            {simResult && (
              <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                {[
                  { label: "Origin", value: simResult.originName },
                  { label: "Regions reached", value: simResult.totalReachable },
                  { label: "Isolated", value: simResult.isolated },
                ].map((m) => (
                  <div key={m.label} style={{ background: "#F1EFE8", borderRadius: 8, padding: "8px 14px", flex: 1, minWidth: 80 }}>
                    <p style={{ margin: 0, fontSize: 11, color: "#888780" }}>{m.label}</p>
                    <p style={{ margin: 0, fontSize: 18, fontWeight: 500, color: "#2C2C2A" }}>{m.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Canvas */}
          <div style={{ background: "#fff", border: "0.5px solid #D3D1C7", borderRadius: 12, padding: 16, marginBottom: 12 }}>
            <GraphCanvas
              regions={regions}
              edges={edges}
              spreadOrder={spreadOrder}
              originId={originId}
              currentStep={currentStep}
            />
            {/* Legend */}
            <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
              {[
                { color: "#E24B4A", label: "Origin / Infected" },
                { color: "#EF9F27", label: "Spreading" },
                { color: "#1D9E75", label: "Healthy" },
                { color: "#888780", label: "Blocked" },
              ].map((l) => (
                <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.color }} />
                  <span style={{ fontSize: 11, color: "#5F5E5A" }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Spread timeline slider */}
          {spreadOrder.length > 0 && (
            <div style={{ background: "#fff", border: "0.5px solid #D3D1C7", borderRadius: 12, padding: 16 }}>
              <SpreadTimeline
                spreadOrder={spreadOrder}
                currentStep={currentStep}
                onStepChange={setCurrentStep}
              />
            </div>
          )}
        </div>

        {/* RIGHT — sidebar */}
        <div>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <button style={tabStyle("control")} onClick={() => setActiveTab("control")}>Admin</button>
            <button style={tabStyle("dsu")}     onClick={() => setActiveTab("dsu")}>DSU</button>
            <button style={tabStyle("check")}   onClick={() => setActiveTab("check")}>Check</button>
          </div>

          <div style={{ background: "#fff", border: "0.5px solid #D3D1C7", borderRadius: 12, padding: 16 }}>
            {activeTab === "control" && (
              <ControlPanel regions={regions} edges={edges} onUpdate={fetchAll} />
            )}

            {activeTab === "dsu" && (
              <DSUComponents components={components} />
            )}

            {activeTab === "check" && (
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, margin: "0 0 10px", color: "#2C2C2A" }}>
                  DSU connectivity check
                </p>
                <p style={{ fontSize: 12, color: "#888780", margin: "0 0 10px" }}>
                  Check if disease can travel between two regions (considering current blocks)
                </p>
                <select
                  value={checkA}
                  onChange={(e) => setCheckA(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "0.5px solid #D3D1C7", fontSize: 13, marginBottom: 8, background: "#fff", color: "#2C2C2A" }}
                >
                  <option value="">Region A...</option>
                  {regions.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
                <select
                  value={checkB}
                  onChange={(e) => setCheckB(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px", borderRadius: 8, border: "0.5px solid #D3D1C7", fontSize: 13, marginBottom: 10, background: "#fff", color: "#2C2C2A" }}
                >
                  <option value="">Region B...</option>
                  {regions.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
                </select>
                <button
                  onClick={handleCheckConnection}
                  style={{ width: "100%", padding: "8px", borderRadius: 8, border: "none", background: "#534AB7", color: "#fff", fontSize: 13, cursor: "pointer" }}
                >
                  Check via DSU
                </button>
                {connCheck && (
                  <div style={{
                    marginTop: 12,
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: connCheck.connected ? "#E1F5EE" : "#FCEBEB",
                    border: `0.5px solid ${connCheck.connected ? "#1D9E75" : "#E24B4A"}`,
                  }}>
                    <p style={{ margin: 0, fontSize: 13, color: connCheck.connected ? "#085041" : "#A32D2D" }}>
                      {connCheck.message}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
