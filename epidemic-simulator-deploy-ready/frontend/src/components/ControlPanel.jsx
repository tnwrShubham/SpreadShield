import { toggleRegionBlock, toggleEdgeBlock } from "../utils/api";

export default function ControlPanel({ regions, edges, onUpdate }) {
  const handleRegionToggle = async (id) => {
    await toggleRegionBlock(id);
    onUpdate();
  };

  const handleEdgeToggle = async (id) => {
    await toggleEdgeBlock(id);
    onUpdate();
  };

  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 500, color: "#2C2C2A", marginBottom: 8 }}>
        Regions
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
        {regions.map((r) => (
          <div
            key={r._id}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "7px 10px",
              borderRadius: 8,
              background: r.isBlocked ? "#FCEBEB" : "#F1EFE8",
              border: `0.5px solid ${r.isBlocked ? "#F09595" : "#D3D1C7"}`,
            }}
          >
            <span style={{ fontSize: 13, color: "#2C2C2A" }}>{r.name}</span>
            <button
              onClick={() => handleRegionToggle(r._id)}
              style={{
                fontSize: 11,
                padding: "3px 10px",
                borderRadius: 6,
                border: `0.5px solid ${r.isBlocked ? "#E24B4A" : "#B4B2A9"}`,
                background: "transparent",
                color: r.isBlocked ? "#A32D2D" : "#5F5E5A",
                cursor: "pointer",
              }}
            >
              {r.isBlocked ? "Unblock" : "Quarantine"}
            </button>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, fontWeight: 500, color: "#2C2C2A", marginBottom: 8 }}>
        Routes
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {edges.map((e) => {
          const fromName = e.from?.name || "?";
          const toName   = e.to?.name   || "?";
          return (
            <div
              key={e._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "7px 10px",
                borderRadius: 8,
                background: e.isBlocked ? "#FCEBEB" : "#F1EFE8",
                border: `0.5px solid ${e.isBlocked ? "#F09595" : "#D3D1C7"}`,
              }}
            >
              <span style={{ fontSize: 12, color: "#2C2C2A", fontFamily: "monospace" }}>
                {fromName} ↔ {toName} ({e.weight}h)
              </span>
              <button
                onClick={() => handleEdgeToggle(e._id)}
                style={{
                  fontSize: 11,
                  padding: "3px 10px",
                  borderRadius: 6,
                  border: `0.5px solid ${e.isBlocked ? "#E24B4A" : "#B4B2A9"}`,
                  background: "transparent",
                  color: e.isBlocked ? "#A32D2D" : "#5F5E5A",
                  cursor: "pointer",
                }}
              >
                {e.isBlocked ? "Reopen" : "Close"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
