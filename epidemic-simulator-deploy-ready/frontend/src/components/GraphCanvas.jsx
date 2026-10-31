import { useEffect, useRef } from "react";

const STATUS_COLORS = {
  healthy:     "#1D9E75",
  infected:    "#E24B4A",
  quarantined: "#EF9F27",
  blocked:     "#888780",
};

export default function GraphCanvas({ regions, edges, spreadOrder, originId, currentStep }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Map region id -> pixel coords
    const coords = {};
    regions.forEach((r) => {
      coords[r._id] = { x: r.x * W, y: r.y * H };
    });

    // Build edge lookup for highlight
    const spreadReachedIds = new Set(
      (spreadOrder || [])
        .filter((s) => s.step <= currentStep)
        .map((s) => s.regionId)
    );

    // Draw edges
    edges.forEach((edge) => {
      const fromId = edge.from?._id || edge.from;
      const toId   = edge.to?._id   || edge.to;
      const from   = coords[fromId];
      const to     = coords[toId];
      if (!from || !to) return;

      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);

      if (edge.isBlocked) {
        ctx.strokeStyle = "#E24B4A";
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = "#B4B2A9";
        ctx.setLineDash([]);
        ctx.lineWidth = 1.5;
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Edge weight label
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2;
      ctx.fillStyle = "#888780";
      ctx.font = "11px sans-serif";
      ctx.fillText(edge.weight + "h", mx + 3, my - 3);
    });

    // Draw nodes
    regions.forEach((r) => {
      const pos = coords[r._id];
      if (!pos) return;

      const isOrigin  = r._id === originId;
      const isReached = spreadReachedIds.has(r._id);

      let color = STATUS_COLORS[r.status] || STATUS_COLORS.healthy;
      if (isOrigin)  color = "#E24B4A";
      if (isReached && !isOrigin) color = "#EF9F27";
      if (r.isBlocked) color = STATUS_COLORS.blocked;

      // Outer ring for origin
      if (isOrigin) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 22, 0, Math.PI * 2);
        ctx.strokeStyle = "#E24B4A";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      ctx.fillStyle = "#fff";
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(r.name.slice(0, 3).toUpperCase(), pos.x, pos.y);

      // Region name below
      ctx.fillStyle = "#2C2C2A";
      ctx.font = "11px sans-serif";
      ctx.fillText(r.name, pos.x, pos.y + 24);

      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
    });
  }, [regions, edges, spreadOrder, originId, currentStep]);

  return (
    <canvas
      ref={canvasRef}
      width={700}
      height={420}
      style={{
        width: "100%",
        height: "auto",
        border: "0.5px solid #D3D1C7",
        borderRadius: "12px",
        background: "#F9F8F4",
      }}
    />
  );
}
