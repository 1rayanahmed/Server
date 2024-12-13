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
    req.collection.findOne({ _id: new ObjectID(req.params.id) }, (err, result) => {
        if (err) return next(err);
        res.send(result);
    });
});

// Update a single document by ID
app.put('/collection/:collectionName/:id', (req, res, next) => {
    const { collectionName, id } = req.params;

    // Validate ID format
    if (!ObjectID.isValid(id)) {
        return res.status(400).send({ error: 'Invalid ID format' });
    }

    // Update the document
    req.collection.updateOne(
        { _id: new ObjectID(id) },
        { $set: req.body },
        (err, result) => {
            if (err) {
                console.error("Update error:", err);
                return next(err);
            }
            if (result.matchedCount === 0) {
                return res.status(404).send({ error: 'Document not found' });
            }
            res.send({ msg: 'success' });
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

// Static File Middleware
var staticPath = path.resolve(__dirname, 'public'); // Directory for static files
app.use(express.static(staticPath));

// Middleware to handle missing files
app.use(function(req, res, next) {
    response.writeHead(200, { "Content-Type": "text/plain "});
    response.end("Looks like you didn't find a static file.")
});


// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
