import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const Dashboard = ({ upcomingMeetings = [], pastMeetings = [] }) => {
  const navigate = useNavigate();

  const handleViewSummary = (meetingId) => {
    navigate(`/summary/${meetingId}`);
  };

  const handleJoinMeeting = () => {
    navigate("/meeting");
  };

  return (
    <div className="dashboard">
      {upcomingMeetings.length > 0 && (
        <section className="meetings-section">
          <h2>Upcoming Meetings</h2>
          <div className="meetings-grid">
            {upcomingMeetings.map((meeting) => (
              <div key={meeting._id} className="meeting-card upcoming">
                <h4>{meeting.heading}</h4>
                <p className="meeting-date">{new Date(meeting.date).toLocaleDateString()}</p>
                <button className="join-meeting-btn" onClick={handleJoinMeeting}>
                  Join Meeting
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="meetings-section">
        <h2>Past Meetings</h2>
        <div className="meetings-grid">
          {pastMeetings.map((meeting) => (
            <div key={meeting._id} className="meeting-card">
              <h4>{meeting.heading}</h4>
              <p className="meeting-date">{new Date(meeting.date).toLocaleDateString()}</p>
              <button className="view-summary-btn" onClick={() => handleViewSummary(meeting._id)}>
                View Summary
              </button>
            </div>
          ))}

          {/* Dummy past meeting */}
          <div className="meeting-card">
            <h4>Project Kickoff</h4>
            <p className="meeting-date">{new Date("2024-02-15").toLocaleDateString()}</p>
            <button className="view-summary-btn" onClick={() => handleViewSummary("dummy-id")}>
              View Summary
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
