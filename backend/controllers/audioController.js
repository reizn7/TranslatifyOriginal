const Audio = require("../models/Transcript");  
const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

let pythonProcess = null; 


exports.uploadAudio = async (req, res) => {
  try {
    const audioPath = path.join(__dirname, "../python/captured_audio.wav");  

    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({ error: "Captured audio file not found!" });
    }

    
    if (pythonProcess) {
      return res.status(400).json({ message: "Python process is already running. Please stop it first." });
    }

    
    pythonProcess = spawn("python", [
      path.join(__dirname, "../python/piyush.py"),  
      audioPath  
    ]);

    let transcript = "";
    pythonProcess.stdout.on("data", (data) => {
      transcript += data.toString();  
    });

    pythonProcess.on("close", async () => {
      
      if (transcript) {
        const newAudio = new Audio({
          filename: "captured_audio.wav",  
          transcript,  
        });

        
        await newAudio.save();
        res.json({ message: "Audio processed and stored successfully", transcript });
      } else {
        res.status(500).json({ error: "Failed to transcribe audio" });
      }
      pythonProcess = null; 
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.stopPythonProcess = (req, res) => {
  if (!pythonProcess) {
    return res.status(400).json({ message: "No Python process is currently running." });
  }

  try {
    pythonProcess.kill(); 
    pythonProcess = null; 
    return res.json({ message: "Python process stopped successfully." });
  } catch (error) {
    console.error("Error stopping Python script:", error);
    return res.status(500).json({ error: error.message });
  }
};


exports.getAllTranscripts = async (req, res) => {
  try {
    const transcripts = await Audio.find();  
    res.json(transcripts);  
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
