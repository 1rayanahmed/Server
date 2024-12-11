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

const MongoClient = require("mongodb").MongoClient;
let db;

MongoClient.connect('mongodb://localhost:27017/', (err, client) => {
    if (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
    db = client.db("Webstore");
    console.log("Connected to MongoDB");
});

app.get("/dbtest", (req, res) => {
    res.send("MongoDB connection working!");
});