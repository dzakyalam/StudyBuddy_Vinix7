interface StageViewProps {
  presenterName?: string;
}

export default function StageView({
  presenterName = "Max Zul",
}: StageViewProps) {
  return (
    <section aria-label="Tampilan Layar Presentasi" style={{ width: "100%" }}>
      {/* Label "Screen" */}
      <h2
        style={{
          fontSize: "13px",
          fontWeight: 700,
          color: "#26354b",
          margin: "0 0 8px 0",
        }}
      >
        Screen
      </h2>

      {/* Panggung Rounded Besar dengan Gradasi Navy/Ungu */}
      <div
        style={{
          width: "100%",
          aspectRatio: "16 / 9",
          minHeight: "190px",
          borderRadius: "20px",
          background:
            "linear-gradient(135deg, #151a36 0%, #2c1a52 50%, #151934 100%)",
          boxShadow: "0 8px 24px rgba(21, 26, 54, 0.15)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxSizing: "border-box",
        }}
      >
        {/* Tulisan "UI | UX" Murni dari CSS */}
        <div
          aria-label="Presentasi UI UX"
          style={{
            fontSize: "36px",
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "3px",
            userSelect: "none",
            textShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <span>UI</span>
          <span style={{ color: "#3688f5", fontWeight: 400 }}>|</span>
          <span>UX</span>
        </div>

        {/* Badge "Presenter: <nama>" */}
        <div
          style={{
            position: "absolute",
            bottom: "12px",
            left: "12px",
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            backdropFilter: "blur(6px)",
            borderRadius: "9999px",
            padding: "4px 12px",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
          }}
        >
          <span
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
              display: "inline-block",
            }}
          />
          <span>Presenter: {presenterName}</span>
        </div>
      </div>
    </section>
  );
}
