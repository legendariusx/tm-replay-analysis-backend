const Joi = require('joi');

// Schema for file array items
const replaySchema = Joi.object().keys({
    filename: Joi.string().required(),
    base64Data: Joi.string().required()
}).required();

// Schema for file array
const analyzeReplaySchema = Joi.array().items(replaySchema).required()

exports.analyzeReplaySchema = analyzeReplaySchema;