const express = require("express");
const app = express();

app.set("port", 3000);

app.get("/", (req, res) => {
    res.send("Server is running!");
});

app.listen(app.get("port"), () => {
    console.log(`Server running on port ${app.get("port")}`);
});