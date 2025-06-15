import React, { useState, useEffect } from "react";

const TriggerPython = ({ selectedLanguage }) => {
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [transcriptions, setTranscriptions] = useState([]);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:5000");

    socket.onopen = () => {
      console.log("WebSocket connected.");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "transcription") {
        setTranscriptions((prev) => [...prev, data.text]);
      } else if (data.type === "status") {
        setResponseMessage(data.message);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected.");
    };

    return () => socket.close();
  }, []);

  const handleTriggerPython = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/python/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: selectedLanguage }),
      });
      const result = await response.json();
      setResponseMessage(result.message);
    } catch (error) {
      console.error("Error triggering Python script:", error);
      setResponseMessage("Error triggering translation.");
    }
    setLoading(false);
  };

  return (
    <div className="trigger-container">
      <button onClick={handleTriggerPython} className="trigger-python-btn" disabled={loading}>
        {loading ? "Processing..." : "Run Translation"}
      </button>
      {responseMessage && <p className="trigger-response">{responseMessage}</p>}
      {transcriptions.length > 0 && (
        <div className="live-transcriptions">
          <h4>Live Transcriptions</h4>
          {transcriptions.map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default TriggerPython;
