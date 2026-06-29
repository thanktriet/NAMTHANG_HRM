export default function Loading() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: 36,
          height: 36,
          border: "4px solid #e5e7eb",
          borderTopColor: "#0057FF",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 12px"
        }} />
        <p style={{ color: "#6b7280", fontSize: 14 }}>Đang tải...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  );
}
