const express = require("express");
const { triggerPythonScript, stopPythonScript } = require("../controllers/pythonController");

const router = express.Router();

// Ensure both functions exist in the controller
if (!triggerPythonScript || !stopPythonScript) {
    throw new Error("Controller functions are undefined. Check pythonController.js");
}

router.post("/trigger", triggerPythonScript); // Route to start the Python script
router.post("/stop", stopPythonScript); // Route to stop the Python script
module.exports = router;
