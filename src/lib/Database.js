const mongoose = require("mongoose");
const { replayModel } = require("../models/Replay");

/**
 * Connects to databse
 * @returns database connection
 */
const connectToDb = () => {
    return mongoose.connect(
        `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:27017/${process.env.DB}?authSource=admin`,
        {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        }
    );
};

/**
 * Queries databse for multiple replays
 * @param {Object} query 
 * @returns replays 
 */
const getReplays = (query) => {
    return replayModel.find(query);
};

/**
 * Queries databse for single replay
 * @param {Object} query 
 * @returns replay
 */
const getReplay = (query) => {
    return replayModel.findOne(query);
};

/**
 * Maps replay data to replay model and stores in database
 * @param {Object} replayData 
 * @returns {Object}
 */
const createReplay = (replayData) => {
    const replay = {
        uuid: replayData.id,
        createdAt: new Date().toISOString(),
        username: replayData.username,
        length: replayData.length,
        numOfRespawns: replayData.numOfRespawns,
        gameVersion: replayData.gameVersion,
        replayUID: replayData.replayUID,
        status: replayData.status,
        inputs: replayData.inputs,
    };

    return replayModel.create(replay);
};

exports.connectToDb = connectToDb;
exports.getReplays = getReplays;
exports.getReplay = getReplay;
exports.createReplay = createReplay;
