const { get } = require("lodash");

const Analysis = require("../lib/Analysis.js");

const { analyzeReplaySchema } = require("../schemas/RequestSchemas");
const { replayQuerySchema } = require("../schemas/QuerySchemas");
const { parseQuery, parseMongoQuery } = require("../lib/QueryParser");
const { getReplays } = require("../lib/Database");

const { demoReplay } = require("../test/demo");

/**
 * Route for getting a demo replay
 */
const demoReplayRoute = (req, res, next) => {
    res.send(demoReplay);
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
    else {
        // Analyzes files in request and returns analyzed data
        new Analysis()
            .analyze(files)
            .then((data) => res.status(201).send(data))
            .catch((err) => next(err));
    }

};

/**
 * Route for querying replays
 */
const getReplaysRoute = (req, res, next) => {
    const query = get(req, "query", {});
    // Parse query
    const parsedQuery = parseQuery(query);

    // Validates query
    const validation = replayQuerySchema.validate(parsedQuery);
    if (validation.error) {
        let error = validation.error;
        error.statusCode = 400;
        next(error);
    }
    else {
        // Parses mongo query
        const mongoQuery = parseMongoQuery(parsedQuery);
        // Queries database for replays
        getReplays(mongoQuery, parseInt(query.limit), get(parsedQuery, 'fields', []).join(' '))
            .then((replays) => res.send(replays))
            .catch((err) => next(err));
    }

};

exports.demoReplayRoute = demoReplayRoute;
exports.analyzeReplaysRoute = analyzeReplaysRoute;
exports.getReplaysRoute = getReplaysRoute;
