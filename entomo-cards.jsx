export default function App() {
  return (
    <div style={{
      background: "#edeae4",
      minHeight: "100vh",
      padding: "28px 20px",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      width: 252,
    }}>

      {/* Things to Do */}
      <div style={card}>
        <div style={meta}>
          <span style={{ ...dot, background: "#f97316" }} />
          4 waiting
        </div>
        <div style={title}>Things to Do</div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 11 }}>
          {["Review Q2 OKR alignment", "Submit peer feedback", "Approve team goal draft"].map((t, i) => (
            <div key={i}>
              <span style={taskText}>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Coach */}
      <div style={card}>
        <div style={meta}>Performance Coach</div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 14 }}>
          <div>
            <div style={{ fontSize: 32, fontWeight: 700, color: "#111827", lineHeight: 1 }}>3.8</div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 13, color: "#22c55e" }}>↑</span>
              past cycle
            </div>
          </div>
          <Sparkline />
        </div>
      </div>

      {/* AI Insights */}
      <div style={card}>
        <div style={meta}>
          <span style={{ ...dot, background: "#8b5cf6" }} />
          3 new signals
        </div>
        <div style={title}>AI Insights</div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { label: "Goal Risk", color: "#ef4444" },
            { label: "Skill Gap", color: "#f97316" },
            { label: "Positive Trend", color: "#22c55e" },
          ].map((ins, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: ins.color, flexShrink: 0 }} />
              <span style={taskText}>{ins.label}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function Sparkline() {
  const data = [62, 70, 58, 75, 80, 74, 83];
  const max = Math.max(...data), min = Math.min(...data), range = max - min;
  const w = 72, h = 30;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: "visible" }}>
      <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={h - ((data[data.length-1] - min) / range) * h} r="3" fill="#6366f1" />
    </svg>
  );
}

const card = {
  background: "#ffffff",
  borderRadius: 16,
  padding: "20px 20px 22px",
  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
};

const meta = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontSize: 11,
  color: "#9ca3af",
  fontWeight: 500,
};

const dot = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  display: "inline-block",
  flexShrink: 0,
};

const title = {
  fontSize: 15,
  fontWeight: 700,
  color: "#111827",
  marginTop: 5,
};

const taskText = {
  fontSize: 12,
  color: "#6b7280",
  lineHeight: 1.4,
};
