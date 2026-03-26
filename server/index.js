import React, { useState } from "react";
import axios from "axios";

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
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/process-audio",
        formData
      );

      setTranscript(res.data.transcript);
      setSummary(res.data.summary);
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>AI Voice Note Summarizer</h1>

      <input type="file" accept="audio/*" onChange={handleFileChange} />
      <br /><br />

      <button onClick={handleUpload}>
        {loading ? "Uploading..." : "Upload Audio"}
      </button>

      {transcript && (
        <div style={{ marginTop: "20px" }}>
          <h2>Transcript</h2>
          <p>{transcript}</p>
        </div>
      )}

      {summary && (
        <div style={{ marginTop: "20px" }}>
          <h2>Summary</h2>
          <p>{summary.summary}</p>

          <h3>Key Points</h3>
          <ul>
            {summary.keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>

          <h3>Action Items</h3>
          <ul>
            {summary.actionItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;