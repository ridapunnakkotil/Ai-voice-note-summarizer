import React, { useState } from "react";
import axios from "axios";

function Card({ title, children, accent }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "22px",
        padding: "24px",
        marginTop: "22px",
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)",
        border: `2px solid ${accent || "#e5e7eb"}`,
      }}
    >
      <h2
        style={{
          margin: "0 0 16px 0",
          fontSize: "28px",
          color: "#0f172a",
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
}

function App() {
  const [file, setFile] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an audio file first.");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://127.0.0.1:8000/process-audio",
        formData
      );

      if (res.data?.error) {
        alert("Backend error: " + res.data.error);
        return;
      }

      setTranscript(res.data?.transcript || "");
      setSummary(
        res.data?.summary || {
          summary: "",
          keyPoints: [],
          actionItems: [],
        }
      );
    } catch (error) {
      console.error("UPLOAD ERROR:", error);
      alert(
        error?.response?.data?.detail ||
          error?.response?.data?.error ||
          error.message ||
          "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #fdf2f8 0%, #eef2ff 35%, #ecfeff 70%, #fefce8 100%)",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            background:
              "linear-gradient(135deg, #7c3aed 0%, #2563eb 50%, #06b6d4 100%)",
            color: "white",
            borderRadius: "30px",
            padding: "40px",
            boxShadow: "0 20px 50px rgba(59, 130, 246, 0.25)",
          }}
        >
          <div
            style={{
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.18)",
              fontSize: "13px",
              fontWeight: "bold",
              letterSpacing: "1px",
              marginBottom: "18px",
            }}
          >
            AI • FULL-STACK • LOCAL MODEL
          </div>

          <h1
            style={{
              fontSize: "54px",
              margin: "0 0 14px 0",
              lineHeight: "1.05",
            }}
          >
            AI Voice Note Summarizer
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "20px",
              lineHeight: "1.7",
              color: "#eef2ff",
              maxWidth: "760px",
            }}
          >
            Upload an audio note and instantly generate a transcript, summary,
            key points, and action items using your local AI transcription pipeline.
          </p>
        </div>

        <Card title="🎙️ Upload Audio" accent="#c4b5fd">
          <p
            style={{
              color: "#475569",
              marginTop: 0,
              marginBottom: "18px",
              fontSize: "16px",
            }}
          >
            Select an audio file from your device and process it through your AI app.
          </p>

          <div
            style={{
              background: "#f8fafc",
              border: "2px dashed #a78bfa",
              borderRadius: "18px",
              padding: "22px",
              marginBottom: "18px",
            }}
          >
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              style={{
                fontSize: "15px",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={handleUpload}
              disabled={loading}
              style={{
                background: loading
                  ? "#94a3b8"
                  : "linear-gradient(135deg, #7c3aed, #2563eb)",
                color: "white",
                border: "none",
                borderRadius: "14px",
                padding: "14px 24px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: "0 10px 24px rgba(99, 102, 241, 0.22)",
              }}
            >
              {loading ? "Processing..." : "Upload Audio"}
            </button>

            {file && (
              <span
                style={{
                  background: "#ede9fe",
                  color: "#5b21b6",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                Selected: {file.name}
              </span>
            )}
          </div>
        </Card>

        {transcript && (
          <Card title="📝 Transcript" accent="#93c5fd">
            <p
              style={{
                margin: 0,
                color: "#334155",
                lineHeight: "1.9",
                fontSize: "17px",
              }}
            >
              {transcript}
            </p>
          </Card>
        )}

        {summary && (
          <>
            <Card title="✨ Summary" accent="#86efac">
              <p
                style={{
                  margin: 0,
                  color: "#334155",
                  lineHeight: "1.9",
                  fontSize: "17px",
                }}
              >
                {summary.summary}
              </p>
            </Card>

            <Card title="🔑 Key Points" accent="#f9a8d4">
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "22px",
                  color: "#334155",
                  lineHeight: "2",
                  fontSize: "16px",
                }}
              >
                {(summary.keyPoints || []).map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </Card>

            <Card title="✅ Action Items" accent="#fdba74">
              <ul
                style={{
                  margin: 0,
                  paddingLeft: "22px",
                  color: "#334155",
                  lineHeight: "2",
                  fontSize: "16px",
                }}
              >
                {(summary.actionItems || []).map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default App;