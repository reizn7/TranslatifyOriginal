const fs = require('fs');
const { google } = require('googleapis');
const express = require('express');
const router = express.Router();
const MeetingSummary = require('../models/MeetingSummary');

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
const TOKEN_PATH = 'token.json';

const authorizeAndFetch = (credentials, callback) => {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

  // Load token
  fs.readFile(TOKEN_PATH, async (err, token) => {
    if (err) return console.log("Token not found. Run auth script.");
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
};

const fetchLatestSummary = async (auth) => {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await gmail.users.messages.list({
    userId: "me",
    q: "subject:Meeting Summary", // Customize this if needed
    maxResults: 1
  });

  if (!res.data.messages || res.data.messages.length === 0) return null;

  const message = await gmail.users.messages.get({
    userId: "me",
    id: res.data.messages[0].id
  });

  const parts = message.data.payload.parts || [message.data.payload];
  const plainTextPart = parts.find(part => part.mimeType === 'text/plain');

  const decodedBody = Buffer.from(plainTextPart.body.data, 'base64').toString();

  // Here you need to parse the summary from the plain email body
  const parsed = {
    title: "Team Sync Meeting",
    date: new Date().toISOString().split('T')[0],
    duration: "1 hour",
    participants: ['Piyush', 'Sarthak', 'Shaurya', 'Palak'],
    minutes: decodedBody.split('\n'), // Simplified for now
    tasks: []
  };

  const summary = new MeetingSummary(parsed);
  await summary.save();

  return parsed;
};

router.get("/fetch-latest-summary", async (req, res) => {
  fs.readFile("credentials.json", (err, content) => {
    if (err) return res.status(500).send("Error loading credentials.");
    authorizeAndFetch(JSON.parse(content), async (auth) => {
      const summary = await fetchLatestSummary(auth);
      if (summary) {
        res.status(200).json(summary);
      } else {
        res.status(404).json({ message: "No summary email found." });
      }
    });
  });
});

module.exports = router;
