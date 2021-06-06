const uuid4 = require("uuid").v4;
const { get } = require("lodash");

const Analysis = require("../lib/Analysis.js");
const Replay = require("../lib/Replay");

const { analyzeReplaySchema } = require("../schemas/Schemas");

/**
 * Route for getting a demo replay 
 */
const testReplayRoute = (req, res, next) => {
    const replay = new Replay(
        uuid4(),
        "../src/test/riolu_replay.Replay.Gbx",
        ""
    );
    replay
        .extractInputsFromReplay()
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.send(err);
        });
};

/**
 * Route for analyzing replays
 */
const analyzeReplaysRoute = (req, res, next) => {
    const files = get(req, "body.files", []);

    // Validates request schema
    const validation = analyzeReplaySchema.validate(files);
    if (validation.error) {
        let error = validation.error;
        error.statusCode = 400;
        next(error);
    }

    // Analyzes files in request and returns analyzed data
    new Analysis().analyze(files)
        .then((data) => res.status(201).send(data))
        .catch((err) => next(err));
};

exports.analyzeReplaysRoute = analyzeReplaysRoute;
exports.testReplayRoute = testReplayRoute;
