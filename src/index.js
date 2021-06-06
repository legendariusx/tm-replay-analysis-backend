require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");

const { connectToDb } = require("./lib/Database");
const { statusRoute } = require("./routes/General");
const { analyzeReplaysRoute, demoReplayRoute, getReplaysRoute } = require("./routes/Replay");

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json({ limit: "5mb" }));
app.use(cors());
app.use(helmet());

app.get("/status", statusRoute);

app.get("/replay/demo", demoReplayRoute);

app.post("/replay/analyze", analyzeReplaysRoute);
app.get("/replay", getReplaysRoute)

// Error handling method
app.use(function handleError(error, req, res, next) {
    if (!error.statusCode) error.statusCode = 500;
    res.status(error.statusCode).send({
        error: error.toString(),
    });
});

// Connect to databse and start server
connectToDb().then(() => {
    app.listen(port, () => {
        console.log(
            `Trackmania Replay Analysis API listening at http://localhost:${port}`
        );
    });
});
