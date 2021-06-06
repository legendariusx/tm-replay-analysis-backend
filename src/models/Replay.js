const mongoose = require("mongoose");

const replaySchema = new mongoose.Schema({
    uuid: { type: String, required: true },
    createdAt: { type: Date, required: true },
    length: { type: Number, required: true },
    numOfRespawns: { type: Number, required: true },
    gameVersion: { type: String, required: true },
    mapUID: { type: String, required: true },
    status: { type: String, required: true },
    inputs: { type: Array, required: true }
});
const replayModel = new mongoose.model('replay', replaySchema);

exports.replayModel = replayModel;

