const express = require("express");
const app = express();
const path = require("path");
const MongoClient = require("mongodb").MongoClient;
const ObjectID = require("mongodb").ObjectID;

app.use(express.json());
app.set('port', 3000);

// Logger Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} request to ${req.url}`);
    next();
});

// Static File Middleware
const staticFilesPath = path.join(__dirname, 'public'); // Directory for static files
app.use('/static', express.static(staticFilesPath));

// Middleware to handle missing files
app.use('/static', (req, res, next) => {
    res.status(404).send({ error: 'File not found' });
});

// CORS Headers Middleware
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});

let db;

// Connect to MongoDB
MongoClient.connect('mongodb+srv://rayanasif2004:rayanis13@cluster0.xt2ft.mongodb.net/', (err, client) => {
    if (err) {
        console.error("Failed to connect to MongoDB:", err);
        process.exit(1);
    }
    db = client.db('Webstore');
    console.log("Connected to MongoDB");
});

// Default route
app.get('/', (req, res) => {
    res.send('Select a collection, e.g., /collection/messages');
});

// Middleware to set collection
app.param('collectionName', (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
});

// Get all documents in a collection
app.get('/collection/:collectionName', (req, res, next) => {
    req.collection.find({}).toArray((err, results) => {
        if (err) return next(err);
        res.send(results);
    });
});

// Insert a new document into a collection
app.post('/collection/:collectionName', (req, res, next) => {
    req.collection.insert(req.body, (err, results) => {
        if (err) return next(err);
        res.send(results.ops);
    });
});

// Get a single document by ID
app.get('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.findOne({ _id: new ObjectId(req.params.id) }, (err, result) => {
        if (err) return next(err);
        res.send(result);
    });
});

// Update a single document by ID
app.put('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.update(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body },
        { safe: true, multi: false },
        (err, result) => {
            if (err) return next(err);
            res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' });
        }
    );
});

// Delete a single document by ID
app.delete('/collection/:collectionName/:id', (req, res, next) => {
    req.collection.deleteOne(
        { _id: ObjectId(req.params.id) },
        (err, result) => {
            if (err) return next(err);
            res.send((result.result.n === 1) ? { msg: 'success' } : { msg: 'error' });
        }
    );
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
