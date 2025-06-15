const { spawn } = require("child_process");
const path = require("path");

let pythonProcess = null; 

exports.triggerPythonScript = (req, res) => {
  try {
    const { language } = req.body; 
    if (!language) {
      return res.status(400).json({ error: "Language parameter is required." });
    }

    const pythonScriptPath = path.join(__dirname, "../python/main.py");

    if (pythonProcess) {
      return res.status(400).json({ message: "Python script is already running." });
    }

    pythonProcess = spawn("python", [pythonScriptPath, language]);

    console.log(`Python script started with PID: ${pythonProcess.pid} and language: ${language}`);

    pythonProcess.stdout.on("data", (data) => {
      console.log(`Python Output: ${data.toString()}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Python Error: ${data.toString()}`);
    });

    pythonProcess.on("close", (code) => {
      console.log(`Python script finished with code: ${code}`);
      pythonProcess = null;
    });

    // Send an immediate response to the frontend
    res.json({ message: `Python script triggered successfully for language: ${language}.` });

  } catch (error) {
    console.error(" Error triggering Python script:", error);
    res.status(500).json({ error: error.message });
  }
};

// Stop Python script function
exports.stopPythonScript = (req, res) => {
  if (!pythonProcess) {
    return res.status(400).json({ message: "No Python script is running." });
  }

  pythonProcess.kill(); // Kill the process
  console.log(" Python script stopped successfully.");
  pythonProcess = null;

  res.json({ message: "Python script stopped successfully." });
};
