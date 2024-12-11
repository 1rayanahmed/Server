const express = require("express");
const app = express();

app.set("port", 3000);

app.get("/", (req, res) => {
    res.send("Server is running!");
});

app.listen(app.get("port"), () => {
    console.log(`Server running on port ${app.get("port")}`);
});

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.url}`);
    next();
});

const path = require('path');
const staticFilesPath = path.join(__dirname, 'public');
app.use('/static', express.static(staticFilesPath));