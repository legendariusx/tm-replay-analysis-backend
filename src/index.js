require("dotenv").config();

const express = require("express");
const _ = require("lodash");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");

const { connectToDb } = require("./lib/Database");
const { statusRoute } = require("./routes/General");
const { analyzeReplaysRoute, testReplayRoute } = require("./routes/Analyze");

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json({ limit: "5mb" }));
app.use(cors());
app.use(helmet());

app.get("/status", statusRoute);

app.get("/testReplay", testReplayRoute);

app.post("/analyze", analyzeReplaysRoute);

connectToDb().then(() => {
    app.listen(port, () => {
        console.log(
            `Trackmania Replay Analysis API listening at http://localhost:${port}`
        );
    });
});
