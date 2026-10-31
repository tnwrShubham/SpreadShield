export default function SpreadTimeline({ spreadOrder, currentStep, onStepChange }) {
  if (!spreadOrder || spreadOrder.length === 0) return null;

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <p style={{ fontSize: 13, color: "#5F5E5A", marginBottom: 8 }}>
        Dijkstra spread order — step {currentStep} of {spreadOrder.length}
      </p>

      <input
        type="range"
        min={0}
        max={spreadOrder.length}
        value={currentStep}
        step={1}
        onChange={(e) => onStepChange(Number(e.target.value))}
        style={{ width: "100%", marginBottom: 12 }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {spreadOrder.map((s) => {
          const active = s.step <= currentStep;
          return (
            <div
              key={s.regionId}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 8,
                background: active ? "#FAEEDA" : "#F1EFE8",
                border: `0.5px solid ${active ? "#EF9F27" : "#D3D1C7"}`,
                opacity: active ? 1 : 0.5,
                transition: "all 0.3s",
              }}
            >
              <span
                style={{
                  minWidth: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: active ? "#EF9F27" : "#B4B2A9",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {s.step}
              </span>
              <span style={{ fontWeight: 500, fontSize: 14, color: "#2C2C2A", flex: 1 }}>
                {s.regionName}
              </span>
              <span style={{ fontSize: 12, color: "#854F0B", fontFamily: "monospace" }}>
                +{s.arrivalTime}h
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
