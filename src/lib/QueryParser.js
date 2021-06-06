const { isUndefined } = require("lodash");

/**
 * Parses query parameteres (mainly arrays)
 * @param {Object} query 
 * @returns query
 */
const parseQuery = (query) => {
    let parsedQuery = {};

    if (!isUndefined(query.limit)) {
        parsedQuery.limit = parseInt(query.limit);
    }

    if (!isUndefined(query.fields)) {
        parsedQuery.fields = query.fields.split(',');
    }

    if (!isUndefined(query.uuid)) {
        parsedQuery.uuid = query.uuid.split(',');
    }

    if (!isUndefined(query.replayUID)) {
        parsedQuery.replayUID = query.replayUID.split(',');
    }

    if (!isUndefined(query.username)) {
        parsedQuery.username = query.username.split(',');
    }

    if (!isUndefined(query.gameVersion)) {
        parsedQuery.gameVersion = query.gameVersion.split(',');
    }

    if (!isUndefined(query.status)) {
        parsedQuery.status = query.status.split(',');
    }

    if (!isUndefined(query.createdAt)) {
        parsedQuery.createdAt = query.createdAt.split(',');
    }

    if (!isUndefined(query.createdAfter)) {
        parsedQuery.createdAfter = query.createdAfter;
    }

    if (!isUndefined(query.createdBefore)) {
        parsedQuery.createdBefore = query.createdBefore;
    }

    return parsedQuery;
}

/**
 * Parses query into mongoose query
 * @param {Object} query 
 * @returns {Object} mongoose query
 */
const parseMongoQuery = (query) => {
    let mongoQuery = {};

    if (!isUndefined(query.uuid)) {
        mongoQuery.uuid = { $in: query.uuid };
    }

    if (!isUndefined(query.replayUID)) {
        mongoQuery.replayUID = { $in: query.replayUID };
    }

    if (!isUndefined(query.username)) {
        mongoQuery.username = { $in: query.username };
    }

    if (!isUndefined(query.gameVersion)) {
        mongoQuery.gameVersion = { $in: query.gameVersion };
    }

    if (!isUndefined(query.status)) {
        mongoQuery.status = { $in: query.status };
    }

    if (!isUndefined(query.createdAt)) {
        mongoQuery.createdAt = { $in: query.createdAt };
    }

    if (!isUndefined(query.createdAfter) && isUndefined(query.createdBefore)) {
        mongoQuery.createdAt = { ...mongoQuery.createdAt, $gte: query.createdAfter };
    }

    if (isUndefined(query.createdAfter) && !isUndefined(query.createdBefore)) {
        mongoQuery.createdAt = { ...mongoQuery.createdAt, $lte: query.createdBefore };
    }

    if (!isUndefined(query.createdAfter) && !isUndefined(query.createdBefore)) {
        mongoQuery.createdAt = { ...mongoQuery.createdAt, $gte: query.createdAfter, $lte: query.createdBefore };
    }

    return mongoQuery;
}

exports.parseQuery = parseQuery;
exports.parseMongoQuery = parseMongoQuery;