const mongoose = require("mongoose");
const { replayModel } = require("../models/Replay");

const connectToDb = () => {
    return mongoose.connect(
        `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:27017/${process.env.DB}?authSource=admin`,
        {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        }
    );
};

const getReplays = () => {
    return replayModel.find();
};

const getReplay = (uuid) => {
    return replayModel.find({ uuid: uuid });
};

const createReplay = (replayData) => {
    const replay = {
        uuid: replayData.id,
        createdAt: new Date().toISOString(),
        length: replayData.length,
        numOfRespawns: replayData.numOfRespawns,
        gameVersion: replayData.gameVersion,
        mapUID: replayData.mapUID,
        status: replayData.status,
        inputs: replayData.inputs,
    };

    return replayModel.create(replay);
};

exports.connectToDb = connectToDb;
exports.getReplays = getReplays;
exports.getReplay = getReplay;
exports.createReplay = createReplay;
