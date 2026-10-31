const COMPONENT_COLORS = [
  { bg: "#EEEDFE", border: "#7F77DD", text: "#3C3489" },
  { bg: "#E1F5EE", border: "#1D9E75", text: "#085041" },
  { bg: "#FAECE7", border: "#D85A30", text: "#712B13" },
  { bg: "#E6F1FB", border: "#378ADD", text: "#0C447C" },
  { bg: "#FAEEDA", border: "#EF9F27", text: "#633806" },
  { bg: "#FBEAF0", border: "#D4537E", text: "#72243E" },
];

export default function DSUComponents({ components }) {
  if (!components || components.length === 0) return null;

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <p style={{ fontSize: 13, color: "#5F5E5A", marginBottom: 10 }}>
        DSU connected components — {components.length} group{components.length > 1 ? "s" : ""}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {components.map((comp, idx) => {
          const color = COMPONENT_COLORS[idx % COMPONENT_COLORS.length];
          const regions = comp.regions || comp; // handle both formats
          return (
            <div
              key={idx}
              style={{
                background: color.bg,
                border: `0.5px solid ${color.border}`,
                borderRadius: 8,
                padding: "10px 14px",
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 500, color: color.text, margin: "0 0 6px" }}>
                Component {idx + 1} — {regions.length} region{regions.length > 1 ? "s" : ""}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {regions.map((r) => {
                  const name = typeof r === "string" ? r : r.name;
                  return (
                    <span
                      key={name}
                      style={{
                        fontSize: 12,
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: "#fff",
                        color: color.text,
                        border: `0.5px solid ${color.border}`,
                      }}
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
