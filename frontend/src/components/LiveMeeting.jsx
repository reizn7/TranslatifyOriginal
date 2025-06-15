import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TriggerPython from "../components/TriggerPython";
import "../styles/LiveMeeting.css";

const LiveMeeting = () => {
  const navigate = useNavigate();
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("hi-IN");

  const languageOptions = [
    { code: "hi-IN", label: "Hindi" },
    { code: "bn-IN", label: "Bengali" },
    { code: "es-ES", label: "Spanish" },
    { code: "fr-FR", label: "French" },
    { code: "de-DE", label: "German" },
  ];

  const handleExecute = () => setIsExecuting(true);
  const handleStop = () => setIsExecuting(false);
  const handleEndMeeting = () => navigate("/summary");

  return (
    <div className="live-meeting">
      <div className="meeting-header">
        <h2 className="meeting-title">Current Meeting</h2>
        <button className="end-meeting-btn" onClick={handleEndMeeting}>
          End Meeting
        </button>
      </div>

      <div className="meeting-content">
        <div className="language-selector">
          <label htmlFor="lang" className="language-label">🎯 Choose Language:</label>
          <select
            id="lang"
            className="language-dropdown"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            {languageOptions.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div className="transcription-panel">
          <h3 className="transcription-title">Meeting Status</h3>
          <div className="transcription-box">
            {isExecuting ? (
              <>
                <p className="translation-status">
                  🔊 Translation is now live in <strong>{languageOptions.find(lang => lang.code === selectedLanguage).label}</strong>!
                </p>
                <p className="status-blinker">⏳ Listening and Translating...</p>
              </>
            ) : (
              <p className="inactive-status">⚡ Ready to launch live translation.</p>
            )}
          </div>
        </div>

        <div className="execute-button-container">
          {!isExecuting ? (
            <button onClick={handleExecute} className="execute-btn">
              🚀 Start Translation
            </button>
          ) : (
            <button onClick={handleStop} className="stop-btn">
              🛑 Stop Translation
            </button>
          )}

          {isExecuting && (
            <TriggerPython selectedLanguage={selectedLanguage} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMeeting;
