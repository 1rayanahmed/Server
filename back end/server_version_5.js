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

app.param("collectionName", (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    next();
});

app.get("/collection/:collectionName", (req, res, next) => {
    req.collection.find({}).toArray((err, results) => {
        if (err) return next(err);
        res.send(results);
    });
});

app.post("/collection/:collectionName", (req, res, next) => {
    req.collection.insert(req.body, (err, results) => {
        if (err) return next(err);
        res.send(results.ops);
    });
});

app.get("/collection/:collectionName/:id", (req, res, next) => {
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (err, result) => {
        if (err) return next(err);
        res.send(result);
    });
});

app.put("/collection/:collectionName/:id", (req, res, next) => {
    req.collection.update(
        { _id: new ObjectID(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (err, result) => {
            if (err) return next(err);
            res.send((result.result.n === 1) ? { msg: "success" } : { msg: "error" });
        }
    );
});

app.delete("/collection/:collectionName/:id", (req, res, next) => {
    req.collection.deleteOne(
        { _id: ObjectID(req.params.id) },
        (err, result) => {
            if (err) return next(err);
            res.send((result.result.n === 1) ? { msg: "success" } : { msg: "error" });
        }
    );
});